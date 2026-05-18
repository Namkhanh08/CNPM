using System.Threading.Tasks;
using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<string>> RegisterAsync(RegisterRequest request);
        Task<LoginResponseDto> LoginAsync(LoginRequest request);
    }
}
