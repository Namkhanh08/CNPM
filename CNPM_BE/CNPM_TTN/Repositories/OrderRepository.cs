using CNPM_TTN.Data;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CNPM_TTN.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;
        private const int PageSize = 10;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        private static OrderDto MapToOrderDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                ReceiverEmail = order.ReceiverEmail,
                ShippingProvince = order.ShippingProvince,
                ShippingDistrict = order.ShippingDistrict,
                ShippingWard = order.ShippingWard,
                ShippingDetailAddress = order.ShippingDetailAddress,
                ShippingNote = order.ShippingNote,
                PaymentMethod = order.PaymentMethod,
                VoucherCode = order.VoucherCode,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.FinalAmount,
                OrderDetails = order.OrderDetails.Select(d => new OrderDetailDto
                {
                    Id = d.Id,
                    ProductId = d.ProductId,
                    ProductName = d.Product?.Name ?? "Sản phẩm không tồn tại",
                    ProductImageUrl = d.Product?.ImageUrl ?? "",
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice,
                    FlavorNotes = d.FlavorNotes,
                    GrindingOptionId = d.GrindingOptionId,
                    Weight = d.Weight
                }).ToList()
            };
        }

        public async Task<PagedOrderResultDto> GetAllOrdersAdminAsync(int page, string searchTerm, string status)
        {
            var query = _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(d => d.Product)
                .AsQueryable();

            // Lọc theo trạng thái
            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                query = query.Where(o => o.Status == status);
            }

            // Lọc theo từ khóa tìm kiếm (Mã đơn hoặc Tên/SĐT khách hàng)
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(o => o.Id.ToString().Contains(searchTerm) ||
                                         (o.ReceiverName != null && o.ReceiverName.ToLower().Contains(searchTerm)) ||
                                         (o.ReceiverPhone != null && o.ReceiverPhone.Contains(searchTerm)));
            }

            var totalItems = await query.CountAsync();

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .ToListAsync();

            return new PagedOrderResultDto
            {
                TotalItems = totalItems,
                Orders = orders.Select(MapToOrderDto).ToList()
            };
        }

        public async Task<IEnumerable<OrderDto>> GetMyOrdersAsync(string userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(d => d.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            return order == null ? null : MapToOrderDto(order);
        }

        public async Task<bool> UpdateOrderStatusAsync(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return false;

            order.Status = status;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> CancelOrderAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            // Chỉ cho hủy khi đơn ở trạng thái chờ xử lý hoặc chờ thanh toán
            if (order.Status != "Chờ xử lý" && order.Status != "Chờ thanh toán")
                return false;

            order.Status = "Đã hủy";
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<OrderDto?> CreateOrderAsync(string userId, CreateOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                decimal totalAmount = 0;
                var orderDetails = new List<OrderDetail>();

                // 1. Tính tổng tiền đơn hàng dựa trên giá sản phẩm thực tế từ Database
                foreach (var item in dto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null) return null;

                    decimal price = product.Price;
                    totalAmount += price * item.Quantity;

                    orderDetails.Add(new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = price,
                        FlavorNotes = item.FlavorNotes,
                        GrindingOptionId = item.GrindingOptionId,
                        Weight = item.Weight
                    });
                }

                // 2. Logic xử lý tính toán và áp dụng Voucher thực tế
                decimal discount = 0;
                Voucher? appliedVoucher = null;

                if (!string.IsNullOrEmpty(dto.VoucherCode))
                {
                    var now = DateTime.UtcNow;

                    // Tìm voucher trong cơ sở dữ liệu dựa theo Code nhập vào
                    appliedVoucher = await _context.Vouchers
                        .FirstOrDefaultAsync(v => v.Code == dto.VoucherCode);

                    if (appliedVoucher != null)
                    {
                        // Kiểm tra toàn diện điều kiện hợp lệ của Voucher
                        bool isValid = appliedVoucher.IsActive &&
                                       appliedVoucher.StartDate <= now &&
                                       appliedVoucher.EndDate >= now &&
                                       appliedVoucher.UsedCount < appliedVoucher.UsageLimit &&
                                       totalAmount >= appliedVoucher.MinOrderValue &&
                                       (string.IsNullOrEmpty(appliedVoucher.PaymentMethod) ||
                                        appliedVoucher.PaymentMethod.Equals(dto.PaymentMethod, StringComparison.OrdinalIgnoreCase));

                        if (isValid)
                        {
                            // Tính số tiền giảm giá dựa theo DiscountType
                            if (appliedVoucher.DiscountType.Equals("Percentage", StringComparison.OrdinalIgnoreCase))
                            {
                                discount = totalAmount * (appliedVoucher.DiscountValue / 100);

                                // Áp dụng chặn trần giảm giá tối đa (MaxDiscount) nếu cấu hình lớn hơn 0
                                if (appliedVoucher.MaxDiscount > 0 && discount > appliedVoucher.MaxDiscount)
                                {
                                    discount = appliedVoucher.MaxDiscount;
                                }
                            }
                            else if (appliedVoucher.DiscountType.Equals("FixedAmount", StringComparison.OrdinalIgnoreCase) ||
                                     appliedVoucher.DiscountType.Equals("Freeship", StringComparison.OrdinalIgnoreCase))
                            {
                                discount = appliedVoucher.DiscountValue;
                            }

                            // Đảm bảo số tiền giảm giá không vượt quá tổng tiền hóa đơn ban đầu
                            if (discount > totalAmount) discount = totalAmount;
                        }
                        else
                        {
                            // Nếu không thỏa mãn bất kỳ điều kiện nào, hủy tham chiếu không áp dụng voucher này
                            appliedVoucher = null;
                        }
                    }
                }

                decimal finalAmount = totalAmount - discount;

                // 3. Khởi tạo đối tượng Order thực thể mới
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.Now,
                    TotalAmount = totalAmount,
                    Status = "Chờ xử lý",
                    ReceiverName = dto.ReceiverName,
                    ReceiverPhone = dto.ReceiverPhone,
                    ReceiverEmail = dto.ReceiverEmail,
                    ShippingProvince = dto.ShippingProvince,
                    ShippingDistrict = dto.ShippingDistrict,
                    ShippingWard = dto.ShippingWard,
                    ShippingDetailAddress = dto.ShippingDetailAddress,
                    ShippingNote = dto.ShippingNote,
                    PaymentMethod = dto.PaymentMethod,
                    VoucherCode = appliedVoucher != null ? appliedVoucher.Code : null,
                    DiscountAmount = discount,
                    FinalAmount = finalAmount,
                    OrderDetails = orderDetails
                };

                await _context.Orders.AddAsync(order);

                // 4. Nếu áp dụng Voucher thành công -> Tiến hành tăng biến đếm số lần sử dụng của Voucher
                if (appliedVoucher != null)
                {
                    appliedVoucher.UsedCount += 1;
                    _context.Vouchers.Update(appliedVoucher);
                }

                // Lưu tất cả thay đổi đồng bộ xuống DB
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetOrderByIdAsync(order.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PagedOrderResultDto> GetShipperOrdersAsync(int page, string searchTerm)
        {
            var query = _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(d => d.Product)
                .Where(o => o.Status == "Đang trung chuyển" || o.Status == "Shipper đã nhận" || o.Status == "Đang giao")
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(o => o.Id.ToString().Contains(searchTerm) ||
                                         (o.ReceiverName != null && o.ReceiverName.ToLower().Contains(searchTerm)));
            }

            var totalItems = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .ToListAsync();

            return new PagedOrderResultDto
            {
                TotalItems = totalItems,
                Orders = orders.Select(MapToOrderDto).ToList()
            };
        }
        public async Task<bool> UpdateOrderAsync(int id, UpdateOrderDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return false;

            // Kiểm tra logic trạng thái (không cho sửa nếu đã giao/hoàn thành)
            var lockedStatuses = new[] { "Đã xác nhận", "Đang giao", "Hoàn thành", "Đã thanh toán" };
            if (lockedStatuses.Contains(order.Status)) return false;

            // Cập nhật thông tin
            order.ReceiverName = dto.ReceiverName ?? order.ReceiverName;
            order.ReceiverPhone = dto.ReceiverPhone ?? order.ReceiverPhone;
            order.ShippingProvince = dto.ShippingProvince ?? order.ShippingProvince;
            order.ShippingDistrict = dto.ShippingDistrict ?? order.ShippingDistrict;
            order.ShippingWard = dto.ShippingWard ?? order.ShippingWard;
            order.ShippingDetailAddress = dto.ShippingDetailAddress ?? order.ShippingDetailAddress;
            order.ShippingNote = dto.ShippingNote ?? order.ShippingNote;
            order.PaymentMethod = dto.PaymentMethod ?? order.PaymentMethod;

            _context.Orders.Update(order);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}