using System;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CNPM_TTN.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ShopCoffeeContext _context;
    private readonly ILogger<SubscriptionService> _logger;

    public SubscriptionService(ShopCoffeeContext context, ILogger<SubscriptionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<SubscriptionDto>> CreateAsync(string userId, CreateSubscriptionDto dto)
    {
        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null)
            return ApiResponse<SubscriptionDto>.FailureResponse("Sản phẩm không tồn tại.");

        var nextDelivery = dto.StartDate;

        var sub = new Subscription
        {
            UserId = userId,
            ProductId = dto.ProductId,
            GrindingOptionId = dto.GrindingOptionId,
            FlavorNotes = dto.FlavorNotes,
            Weight = dto.Weight,
            Quantity = dto.Quantity,
            Frequency = dto.Frequency,
            StartDate = dto.StartDate,
            NextDeliveryDate = nextDelivery,
            ReceiverName = dto.ReceiverName,
            ReceiverPhone = dto.ReceiverPhone,
            ShippingProvince = dto.ShippingProvince,
            ShippingDistrict = dto.ShippingDistrict,
            ShippingWard = dto.ShippingWard,
            ShippingDetailAddress = dto.ShippingDetailAddress,
            PaymentMethod = dto.PaymentMethod,
            Status = "active",
            CreatedAt = DateTime.UtcNow
        };

        _context.Subscriptions.Add(sub);
        await _context.SaveChangesAsync();

        return ApiResponse<SubscriptionDto>.SuccessResponse(MapToDto(sub, product));
    }

    public async Task<ApiResponse<List<SubscriptionDto>>> GetByUserAsync(string userId)
    {
        var subs = await _context.Subscriptions
            .Include(s => s.Product)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var result = subs.Select(s => MapToDto(s, s.Product)).ToList();
        return ApiResponse<List<SubscriptionDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponse<string>> PauseAsync(int id, string userId)
    {
        var sub = await _context.Subscriptions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        if (sub == null) return ApiResponse<string>.FailureResponse("Không tìm thấy gói subscription.");
        if (sub.Status != "active") return ApiResponse<string>.FailureResponse("Chỉ có thể tạm dừng gói đang hoạt động.");

        sub.Status = "paused";
        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse("Tạm dừng gói subscription thành công.");
    }

    public async Task<ApiResponse<string>> ResumeAsync(int id, string userId)
    {
        var sub = await _context.Subscriptions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        if (sub == null) return ApiResponse<string>.FailureResponse("Không tìm thấy gói subscription.");
        if (sub.Status != "paused") return ApiResponse<string>.FailureResponse("Chỉ có thể kích hoạt lại gói đang bị tạm dừng.");

        sub.Status = "active";
        // Nếu ngày giao hàng tiếp theo đã trôi qua trong quá khứ, dời nó lên hôm nay/tương lai
        if (sub.NextDeliveryDate < DateTime.UtcNow)
        {
            sub.NextDeliveryDate = DateTime.UtcNow.Date;
        }

        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse("Kích hoạt lại gói subscription thành công.");
    }

    public async Task<ApiResponse<string>> CancelAsync(int id, string userId)
    {
        var sub = await _context.Subscriptions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        if (sub == null) return ApiResponse<string>.FailureResponse("Không tìm thấy gói subscription.");
        if (sub.Status == "cancelled") return ApiResponse<string>.FailureResponse("Gói subscription đã bị hủy.");

        sub.Status = "cancelled";
        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse("Hủy gói subscription thành công.");
    }

    /// <summary>
    /// Cron job: tự động tạo đơn hàng cho các gói subscription đến hạn giao hàng hôm nay
    /// </summary>
    public async Task ProcessDueSubscriptionsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var dueSubs = await _context.Subscriptions
            .Include(s => s.Product)
            .Where(s => s.Status == "active" && s.NextDeliveryDate.Date <= today)
            .ToListAsync();

        _logger.LogInformation("Processing {Count} due subscriptions.", dueSubs.Count);

        foreach (var sub in dueSubs)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Kiểm tra tồn kho của sản phẩm
                var product = sub.Product;
                if (product.Stock < sub.Quantity)
                {
                    _logger.LogWarning("Subscription #{SubId} failed due to insufficient stock for product '{ProductName}' (Stock: {Stock}, Required: {Req}).",
                        sub.Id, product.Name, product.Stock, sub.Quantity);

                    // Tạm hoãn ngày giao tiếp theo thêm 1 ngày để thử lại vào ngày mai
                    sub.NextDeliveryDate = DateTime.UtcNow.Date.AddDays(1);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    continue;
                }

                // 2. Lấy thông tin User để tính chiết khấu Diamond và tích lũy Loyalty
                var user = await _context.Users.FindAsync(sub.UserId);
                decimal totalAmount = product.Price * sub.Quantity;
                decimal discountAmount = 0;

                // 2.1. Áp dụng ưu đãi giảm giá theo chu kỳ đăng ký (Frequency Discount)
                // weekly: giảm 10%, biweekly: giảm 5%, monthly: 0%
                decimal frequencyDiscountRate = sub.Frequency switch
                {
                    "weekly" => 0.10m,
                    "biweekly" => 0.05m,
                    _ => 0m
                };
                decimal frequencyDiscount = Math.Round(totalAmount * frequencyDiscountRate);
                discountAmount += frequencyDiscount;

                // 2.2. Áp dụng chiết khấu hạng Diamond (10% trên số tiền còn lại sau giảm giá chu kỳ)
                if (user != null && "Diamond".Equals(user.MemberTier, StringComparison.OrdinalIgnoreCase))
                {
                    decimal remainingAmount = totalAmount - frequencyDiscount;
                    decimal tierDiscount = Math.Round(remainingAmount * 0.1m);
                    discountAmount += tierDiscount;
                }

                decimal finalAmount = Math.Max(0, totalAmount - discountAmount);

                // 3. Tạo đơn hàng mới (đồng bộ múi giờ với OrderService là DateTime.Now)
                var order = new Order
                {
                    UserId = sub.UserId,
                    OrderDate = DateTime.Now, // Đồng bộ với giờ local của server
                    TotalAmount = finalAmount,
                    DiscountAmount = discountAmount,
                    Status = sub.PaymentMethod == "VNPAY" ? "Chờ thanh toán" : "Chờ xử lý",
                    ReceiverName = sub.ReceiverName,
                    ReceiverPhone = sub.ReceiverPhone,
                    ShippingProvince = sub.ShippingProvince,
                    ShippingDistrict = sub.ShippingDistrict,
                    ShippingWard = sub.ShippingWard,
                    ShippingDetailAddress = sub.ShippingDetailAddress,
                    PaymentMethod = sub.PaymentMethod ?? "COD",
                    ShippingNote = $"[Subscription #{sub.Id}] Giao tự động"
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // 4. Tạo chi tiết đơn hàng
                _context.OrderDetails.Add(new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = sub.ProductId,
                    Quantity = sub.Quantity,
                    UnitPrice = product.Price,
                    GrindingOptionId = sub.GrindingOptionId,
                    FlavorNotes = sub.FlavorNotes
                });
                await _context.SaveChangesAsync();

                // 5. Cập nhật tồn kho sản phẩm và ghi nhận InventoryLog
                int oldStock = product.Stock;
                product.Stock -= sub.Quantity;
                await _context.SaveChangesAsync();

                var log = new InventoryLog
                {
                    ProductId = product.Id,
                    Action = $"Xuất kho bán hàng tự động (Đăng ký định kỳ #{sub.Id}, Đơn hàng #{order.Id})",
                    OldQuantity = oldStock,
                    NewQuantity = product.Stock,
                    ModifiedBy = "System (CronJob)",
                    ModifiedDate = DateTime.Now,
                    UserId = sub.UserId
                };
                _context.InventoryLogs.Add(log);
                await _context.SaveChangesAsync();

                // 6. Tích lũy Loyalty Points kèm hệ số nhân (Multiplier) theo tần suất
                if (user != null)
                {
                    decimal loyaltyMultiplier = sub.Frequency switch
                    {
                        "weekly" => 1.5m,   // Nhân x1.5 điểm loyalty cho gói giao hàng tuần
                        "biweekly" => 1.2m, // Nhân x1.2 điểm loyalty cho gói giao 2 tuần/lần
                        _ => 1.0m           // Nhân x1.0 cho gói cơ bản hàng tháng
                    };

                    int earnedPoints = (int)(finalAmount / 1000m * loyaltyMultiplier);
                    if (earnedPoints > 0)
                    {
                        user.TotalPoints += earnedPoints;

                        // Cập nhật lại hạng thành viên
                        user.MemberTier = user.TotalPoints switch
                        {
                            >= 5000 => "Diamond",
                            >= 2000 => "Gold",
                            >= 500 => "Silver",
                            _ => "Bronze"
                        };

                        _context.LoyaltyPoints.Add(new LoyaltyPoint
                        {
                            UserId = sub.UserId,
                            Points = earnedPoints,
                            Type = "earn",
                            Description = $"Tích điểm x{loyaltyMultiplier} từ gói đăng ký định kỳ #{sub.Id} (Đơn hàng #{order.Id})",
                            OrderId = order.Id,
                            CreatedAt = DateTime.UtcNow
                        });
                        await _context.SaveChangesAsync();
                    }
                }

                // 7. Tính toán ngày giao tiếp theo cho Subscription
                sub.NextDeliveryDate = sub.Frequency switch
                {
                    "weekly"   => sub.NextDeliveryDate.AddDays(7),
                    "biweekly" => sub.NextDeliveryDate.AddDays(14),
                    _          => sub.NextDeliveryDate.AddMonths(1) // monthly
                };

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation("Created order #{OrderId} for subscription #{SubId} successfully.", order.Id, sub.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Failed to process subscription #{SubId}. Rolled back transaction.", sub.Id);
            }
        }
    }

    private static SubscriptionDto MapToDto(Subscription s, Product? p) => new SubscriptionDto
    {
        Id = s.Id,
        ProductId = s.ProductId,
        ProductName = p?.Name,
        ProductImage = p?.ImageUrl,
        GrindingOptionId = s.GrindingOptionId,
        FlavorNotes = s.FlavorNotes,
        Weight = s.Weight,
        Quantity = s.Quantity,
        Frequency = s.Frequency,
        StartDate = s.StartDate,
        NextDeliveryDate = s.NextDeliveryDate,
        ReceiverName = s.ReceiverName,
        ReceiverPhone = s.ReceiverPhone,
        ShippingProvince = s.ShippingProvince,
        ShippingDistrict = s.ShippingDistrict,
        ShippingWard = s.ShippingWard,
        ShippingDetailAddress = s.ShippingDetailAddress,
        PaymentMethod = s.PaymentMethod,
        Status = s.Status,
        CreatedAt = s.CreatedAt
    };

    public async Task<ApiResponse<object>> GetAllForAdminAsync(int page, int pageSize, string? status, string? searchTerm)
    {
        var query = _context.Subscriptions
            .Include(s => s.Product)
            .Include(s => s.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(s => s.Status == status);
        }

        if (!string.IsNullOrEmpty(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(s => s.ReceiverName.ToLower().Contains(term)
                                  || s.ReceiverPhone.Contains(term)
                                  || s.Product.Name.ToLower().Contains(term)
                                  || s.User.Name.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtoItems = items.Select(s => MapToAdminDto(s, s.Product, s.User)).ToList();

        return ApiResponse<object>.SuccessResponse(new
        {
            Items = dtoItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<string>> AdminUpdateStatusAsync(int id, string status)
    {
        var sub = await _context.Subscriptions.FindAsync(id);
        if (sub == null) return ApiResponse<string>.FailureResponse("Không tìm thấy gói subscription.");

        var validStatuses = new[] { "active", "paused", "cancelled" };
        if (!validStatuses.Contains(status.ToLower()))
        {
            return ApiResponse<string>.FailureResponse("Trạng thái không hợp lệ. Chỉ chấp nhận: active, paused, cancelled.");
        }

        sub.Status = status.ToLower();

        if (sub.Status == "active" && sub.NextDeliveryDate < DateTime.UtcNow)
        {
            sub.NextDeliveryDate = DateTime.UtcNow.Date;
        }

        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse($"Cập nhật trạng thái subscription sang '{status}' thành công.");
    }

    private static SubscriptionAdminDto MapToAdminDto(Subscription s, Product? p, User? u) => new SubscriptionAdminDto
    {
        Id = s.Id,
        ProductId = s.ProductId,
        ProductName = p?.Name,
        ProductImage = p?.ImageUrl,
        GrindingOptionId = s.GrindingOptionId,
        FlavorNotes = s.FlavorNotes,
        Weight = s.Weight,
        Quantity = s.Quantity,
        Frequency = s.Frequency,
        StartDate = s.StartDate,
        NextDeliveryDate = s.NextDeliveryDate,
        ReceiverName = s.ReceiverName,
        ReceiverPhone = s.ReceiverPhone,
        ShippingProvince = s.ShippingProvince,
        ShippingDistrict = s.ShippingDistrict,
        ShippingWard = s.ShippingWard,
        ShippingDetailAddress = s.ShippingDetailAddress,
        PaymentMethod = s.PaymentMethod,
        Status = s.Status,
        CreatedAt = s.CreatedAt,
        UserEmail = u?.Email,
        UserFullName = u?.Name
    };
}
