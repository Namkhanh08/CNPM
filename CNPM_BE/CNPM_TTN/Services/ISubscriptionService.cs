using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services;

public interface ISubscriptionService
{
    Task<ApiResponse<SubscriptionDto>> CreateAsync(string userId, CreateSubscriptionDto dto);
    Task<ApiResponse<List<SubscriptionDto>>> GetByUserAsync(string userId);
    Task<ApiResponse<string>> PauseAsync(int id, string userId);
    Task<ApiResponse<string>> ResumeAsync(int id, string userId);
    Task<ApiResponse<string>> ToggleSkipAsync(int id, string userId);
    Task<ApiResponse<string>> CancelAsync(int id, string userId);
    Task<ApiResponse<SubscriptionDto>> UpdateConfigAsync(int id, string userId, UpdateSubscriptionConfigDto dto);
    Task ProcessDueSubscriptionsAsync();
    Task<ApiResponse<object>> GetAllForAdminAsync(int page, int pageSize, string? status, string? searchTerm);
    Task<ApiResponse<string>> AdminUpdateStatusAsync(int id, string status);
}
