using System;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Services;

public class LoyaltyService : ILoyaltyService
{
    private readonly ShopCoffeeContext _context;

    // Tỉ lệ: 1000đ = 1 điểm
    private const decimal POINTS_PER_VND = 1000m;
    // Đổi điểm: 100 điểm = voucher 10.000đ
    private const int REDEEM_POINTS_UNIT = 100;
    private const decimal REDEEM_VALUE_UNIT = 10000m;

    public LoyaltyService(ShopCoffeeContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<LoyaltyInfoDto>> GetLoyaltyInfoAsync(string userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return ApiResponse<LoyaltyInfoDto>.FailureResponse("Người dùng không tồn tại.");

        var history = await _context.LoyaltyPoints
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(20)
            .Select(l => new LoyaltyHistoryDto
            {
                Points = l.Points,
                Type = l.Type,
                Description = l.Description,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        var (nextTier, pointsToNext) = GetNextTierInfo(user.TotalPoints);

        return ApiResponse<LoyaltyInfoDto>.SuccessResponse(new LoyaltyInfoDto
        {
            TotalPoints = user.TotalPoints,
            MemberTier = user.MemberTier,
            NextTier = nextTier,
            PointsToNextTier = pointsToNext,
            History = history
        });
    }

    public async Task EarnPointsAsync(string userId, int orderId, decimal orderTotal)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;

        int earnedPoints = (int)(orderTotal / POINTS_PER_VND);
        if (earnedPoints <= 0) return;

        user.TotalPoints += earnedPoints;
        user.MemberTier = CalculateTier(user.TotalPoints);

        _context.LoyaltyPoints.Add(new LoyaltyPoint
        {
            UserId = userId,
            Points = earnedPoints,
            Type = "earn",
            Description = $"Tích điểm từ đơn hàng #{orderId}",
            OrderId = orderId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<VoucherDto>> RedeemPointsAsync(string userId, int points)
    {
        if (points < REDEEM_POINTS_UNIT || points % REDEEM_POINTS_UNIT != 0)
            return ApiResponse<VoucherDto>.FailureResponse($"Điểm đổi phải là bội số của {REDEEM_POINTS_UNIT}.");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return ApiResponse<VoucherDto>.FailureResponse("Người dùng không tồn tại.");

        if (user.TotalPoints < points)
            return ApiResponse<VoucherDto>.FailureResponse($"Số điểm không đủ. Bạn có {user.TotalPoints} điểm.");

        decimal voucherValue = (points / REDEEM_POINTS_UNIT) * REDEEM_VALUE_UNIT;
        string voucherCode = $"LOYALTY{userId[..6].ToUpper()}{DateTime.UtcNow:yyyyMMddHHmmss}";

        // Tạo voucher 1 lần dùng
        var voucher = new Voucher
        {
            Code = voucherCode,
            Name = $"Voucher đổi điểm {points} điểm",
            DiscountType = "amount",
            DiscountValue = voucherValue,
            MinOrderValue = 0,
            MaxUsage = 1,
            UsedCount = 0,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsActive = true
        };

        user.TotalPoints -= points;
        user.MemberTier = CalculateTier(user.TotalPoints);

        _context.Vouchers.Add(voucher);
        _context.LoyaltyPoints.Add(new LoyaltyPoint
        {
            UserId = userId,
            Points = -points,
            Type = "redeem",
            Description = $"Đổi {points} điểm lấy voucher {voucherCode} ({voucherValue:N0}đ)",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return ApiResponse<VoucherDto>.SuccessResponse(new VoucherDto
        {
            Id = voucher.Id,
            Code = voucher.Code,
            Name = voucher.Name,
            DiscountType = voucher.DiscountType,
            DiscountValue = voucher.DiscountValue,
            StartDate = voucher.StartDate,
            EndDate = voucher.EndDate,
            IsActive = true
        });
    }

    private static string CalculateTier(int points) => points switch
    {
        >= 5000 => "Diamond",
        >= 2000 => "Gold",
        >= 500  => "Silver",
        _       => "Bronze"
    };

    private static (string nextTier, int pointsNeeded) GetNextTierInfo(int points)
    {
        if (points >= 5000) return ("Diamond", 0);
        if (points >= 2000) return ("Diamond", 5000 - points);
        if (points >= 500)  return ("Gold", 2000 - points);
        return ("Silver", 500 - points);
    }
}
