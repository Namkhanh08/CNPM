using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services;

public interface ISubscriptionService
{
    Task<ApiResponse<SubscriptionDto>> CreateAsync(string userId, CreateSubscriptionDto dto);
    Task<ApiResponse<List<SubscriptionDto>>> GetByUserAsync(string userId);
    Task<ApiResponse<string>> PauseAsync(int id, string userId);
    Task<ApiResponse<string>> ResumeAsync(int id, string userId);
    Task<ApiResponse<string>> CancelAsync(int id, string userId);
    Task ProcessDueSubscriptionsAsync(); // Cron job gọi hàng ngày
}
