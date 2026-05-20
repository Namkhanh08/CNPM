using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetUsersAsync();
        Task<UserDto?> GetUserByIdAsync(string id);
        Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto dto);
        Task<ApiResponse<string>> UpdateUserAsync(string id, UpdateUserDto dto);
        Task<ApiResponse<string>> DeleteUserAsync(string id);
    }
}
