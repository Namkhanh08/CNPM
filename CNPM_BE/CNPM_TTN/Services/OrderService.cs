using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CNPM_TTN.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<OrderDetail> _orderDetailRepository;
        private readonly IRepository<Cart> _cartRepository;
        private readonly IRepository<CartItem> _cartItemRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<InventoryLog> _inventoryLogRepository;
        private readonly IVoucherService _voucherService;
        private readonly ILoyaltyService _loyaltyService;
        private readonly ShopCoffeeContext _context;

        public OrderService(
            IRepository<Order> orderRepository,
            IRepository<OrderDetail> orderDetailRepository,
            IRepository<Cart> cartRepository,
            IRepository<CartItem> cartItemRepository,
            IRepository<Product> productRepository,
            IRepository<InventoryLog> inventoryLogRepository,
            IVoucherService voucherService,
            ILoyaltyService loyaltyService,
            ShopCoffeeContext context)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _productRepository = productRepository;
            _inventoryLogRepository = inventoryLogRepository;
            _voucherService = voucherService;
            _loyaltyService = loyaltyService;
            _context = context;
        }

        public async Task<Order> CreateOrderFromCartAsync(string userId, OrderRequestDto dto)
        {
            // 1. Lấy giỏ hàng TRƯỚC khi mở transaction
            var cart = await _cartRepository.Query()
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new InvalidOperationException("Giỏ hàng của bạn đang trống.");
            }

            // Kiểm tra tồn kho TRƯỚC transaction để tránh rollback không cần thiết
            foreach (var item in cart.CartItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId)
                    ?? throw new KeyNotFoundException($"Sản phẩm có Id {item.ProductId} không tồn tại.");

                if (product.Stock < item.Quantity)
                    throw new InvalidOperationException(
                        $"Sản phẩm '{product.Name}' không đủ hàng tồn kho (Tồn: {product.Stock}, Yêu cầu: {item.Quantity}).");
            }

            // Validate voucher TRƯỚC transaction
            decimal discountAmount = 0;
            string? voucherCode = null;
            if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
            {
                var voucherResult = await _voucherService.ValidateAsync(dto.VoucherCode.Trim().ToUpper(), 0);
                if (voucherResult.Success && voucherResult.Data != null && voucherResult.Data.IsValid)
                {
                    voucherCode = dto.VoucherCode.Trim().ToUpper();
                }
                else if (!string.IsNullOrWhiteSpace(voucherResult.Data?.Message))
                {
                    throw new InvalidOperationException(voucherResult.Data.Message);
                }
            }

            // --- BẮT ĐẦU TRANSACTION ---
            await using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 2. Tạo đơn hàng mới
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.Now,
                    Status = "Chờ xử lý",
                    ReceiverName = dto.ReceiverName,
                    ReceiverPhone = dto.ReceiverPhone,
                    ReceiverEmail = dto.ReceiverEmail,
                    ShippingProvince = dto.ShippingProvince,
                    ShippingDistrict = dto.ShippingDistrict,
                    ShippingWard = dto.ShippingWard,
                    ShippingDetailAddress = dto.ShippingDetailAddress,
                    ShippingNote = dto.ShippingNote,
                    PaymentMethod = dto.PaymentMethod ?? "COD",
                    TotalAmount = 0
                };

                await _orderRepository.AddAsync(order);

                decimal totalAmount = 0;

                // 3. Xử lý từng sản phẩm trong giỏ hàng
                foreach (var item in cart.CartItems.ToList())
                {
                    var product = (await _productRepository.GetByIdAsync(item.ProductId))!;

                    // Tính tiền
                    var itemTotal = product.Price * item.Quantity;
                    totalAmount += itemTotal;

                    // Tạo chi tiết đơn hàng
                    var orderDetail = new OrderDetail
                    {
                        OrderId = order.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        FlavorNotes = item.FlavorNotes,
                        GrindingOptionId = item.GrindingOptionId
                    };
                    await _orderDetailRepository.AddAsync(orderDetail);

                    // Kiểm tra tồn kho lần nữa bên trong transaction để chống Race Condition
                    if (product.Stock < item.Quantity)
                    {
                        throw new InvalidOperationException(
                            $"Sản phẩm '{product.Name}' hiện không đủ số lượng trong kho (chỉ còn {product.Stock}). Vui lòng cập nhật lại giỏ hàng.");
                    }

                    // Cập nhật tồn kho sản phẩm
                    int oldStock = product.Stock;
                    product.Stock -= item.Quantity;
                    await _productRepository.UpdateAsync(product);

                    // Ghi log kho (Inventory Log)
                    var log = new InventoryLog
                    {
                        ProductId = product.Id,
                        Action = $"Xuất kho bán hàng (Đơn hàng #{order.Id})",
                        OldQuantity = oldStock,
                        NewQuantity = product.Stock,
                        ModifiedBy = "System",
                        ModifiedDate = DateTime.Now,
                        UserId = userId
                    };
                    await _inventoryLogRepository.AddAsync(log);
                }

                // 4. Áp dụng voucher và tính tổng tiền
                if (voucherCode != null)
                {
                    var orderProductIds = cart.CartItems
                        .Select(item => item.ProductId)
                        .Distinct()
                        .ToList();
                    var voucherResult = await _voucherService.ValidateAsync(voucherCode, totalAmount, order.PaymentMethod, userId, orderProductIds);
                    if (voucherResult.Success && voucherResult.Data != null && voucherResult.Data.IsValid)
                    {
                        discountAmount = voucherResult.Data.DiscountAmount;
                        await _voucherService.IncrementUsageAsync(voucherCode, userId, order.Id);
                    }
                    else
                    {
                        var errMsg = voucherResult.Data?.Message ?? voucherResult.Message ?? "Mã giảm giá không hợp lệ hoặc đã hết hạn.";
                        throw new InvalidOperationException(errMsg);
                    }
                }

                // 4.5 Áp dụng chiết khấu hạng Diamond (10% tổng tiền hàng)
                var user = await _context.Users.FindAsync(userId);
                if (user != null && "Diamond".Equals(user.MemberTier, StringComparison.OrdinalIgnoreCase))
                {
                    decimal tierDiscount = Math.Round(totalAmount * 0.1m);
                    discountAmount += tierDiscount;
                }

                // 5. Cập nhật tổng tiền đơn hàng
                order.VoucherCode = voucherCode;
                order.DiscountAmount = discountAmount;
                order.TotalAmount = Math.Max(0, totalAmount - discountAmount);
                await _orderRepository.UpdateAsync(order);

                // 6. Xóa sạch giỏ hàng của user
                foreach (var item in cart.CartItems.ToList())
                {
                    await _cartItemRepository.DeleteAsync(item);
                }

                // --- COMMIT TRANSACTION (tất cả thành công) ---
                await transaction.CommitAsync();

                // 7. Tích điểm Loyalty (ngoài transaction — lỗi không ảnh hưởng đơn hàng)
                try
                {
                    await _loyaltyService.EarnPointsAsync(userId, order.Id, order.TotalAmount);
                }
                catch (Exception)
                {
                    // Không để lỗi tích điểm làm hỏng giao dịch đặt hàng chính
                }

                return order;
            }
            catch
            {
                // --- ROLLBACK nếu có bất kỳ lỗi nào ---
                await transaction.RollbackAsync();
                throw; // Re-throw để Controller xử lý và trả lỗi về FE
            }
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId)
        {
            return await _orderRepository.Query()
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId, string userId)
        {
            return await _orderRepository.Query()
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);
        }

        public async Task<Order> CancelOrderAsync(int orderId, string userId)
        {
            var order = await _orderRepository.Query()
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            if (order.Status != "Chờ xử lý")
            {
                throw new InvalidOperationException("Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xử lý'.");
            }

            // Cập nhật trạng thái đơn
            order.Status = "Đã hủy";
            await _orderRepository.UpdateAsync(order);

            // Hoàn trả lại tồn kho sản phẩm
            foreach (var detail in order.OrderDetails)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product != null)
                {
                    int oldStock = product.Stock;
                    product.Stock += detail.Quantity;
                    await _productRepository.UpdateAsync(product);

                    // Ghi log hoàn kho
                    var log = new InventoryLog
                    {
                        ProductId = product.Id,
                        Action = $"Hoàn kho do hủy đơn hàng #{order.Id}",
                        OldQuantity = oldStock,
                        NewQuantity = product.Stock,
                        ModifiedBy = "System",
                        ModifiedDate = DateTime.Now,
                        UserId = userId
                    };
                    await _inventoryLogRepository.AddAsync(log);
                }
            }

            return order;
        }

        public async Task<Order> CompleteOrderAsync(int orderId, string userId)
        {
            var order = await _orderRepository.Query()
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            if (order.Status != "Đang giao")
            {
                throw new InvalidOperationException("Chỉ có thể xác nhận đã nhận hàng cho các đơn hàng ở trạng thái 'Đang giao'.");
            }

            order.Status = "Hoàn thành";
            await _orderRepository.UpdateAsync(order);
            return order;
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _orderRepository.Query()
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _orderRepository.Query()
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            // Nếu đơn hàng bị hủy bởi Admin, hoàn kho
            if (status == "Đã hủy" && order.Status != "Đã hủy")
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _productRepository.GetByIdAsync(detail.ProductId);
                    if (product != null)
                    {
                        int oldStock = product.Stock;
                        product.Stock += detail.Quantity;
                        await _productRepository.UpdateAsync(product);

                        var log = new InventoryLog
                        {
                            ProductId = product.Id,
                            Action = $"Hoàn kho (Admin hủy đơn hàng #{order.Id})",
                            OldQuantity = oldStock,
                            NewQuantity = product.Stock,
                            ModifiedBy = "Admin",
                            ModifiedDate = DateTime.Now,
                            UserId = order.UserId
                        };
                        await _inventoryLogRepository.AddAsync(log);
                    }
                }
            }

            order.Status = status;
            await _orderRepository.UpdateAsync(order);
            return order;
        }
    }
}
