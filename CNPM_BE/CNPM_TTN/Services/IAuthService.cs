using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<string>> RegisterAsync(RegisterRequest request);
        Task<ApiResponse<object>> LoginAsync(LoginRequest request);
    }
}
