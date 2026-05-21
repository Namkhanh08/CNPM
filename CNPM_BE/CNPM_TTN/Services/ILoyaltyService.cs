using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services;

public interface ILoyaltyService
{
    Task<ApiResponse<LoyaltyInfoDto>> GetLoyaltyInfoAsync(string userId);
    Task EarnPointsAsync(string userId, int orderId, decimal orderTotal);
    Task<ApiResponse<VoucherDto>> RedeemPointsAsync(string userId, int points);
}
