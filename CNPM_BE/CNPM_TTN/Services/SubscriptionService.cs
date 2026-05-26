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
                // Tạo đơn hàng tự động
                var order = new Order
                {
                    UserId = sub.UserId,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = sub.Product.Price * sub.Quantity,
                    Status = "Chờ xử lý",
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

                _context.OrderDetails.Add(new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = sub.ProductId,
                    Quantity = sub.Quantity,
                    UnitPrice = sub.Product.Price,
                    GrindingOptionId = sub.GrindingOptionId,
                    FlavorNotes = sub.FlavorNotes
                });
                await _context.SaveChangesAsync();

                // Tính ngày giao tiếp theo
                sub.NextDeliveryDate = sub.Frequency switch
                {
                    "weekly"   => sub.NextDeliveryDate.AddDays(7),
                    "biweekly" => sub.NextDeliveryDate.AddDays(14),
                    _          => sub.NextDeliveryDate.AddMonths(1) // monthly
                };

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation("Created order #{OrderId} for subscription #{SubId}", order.Id, sub.Id);
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
}
