using System.Security.Cryptography;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;

namespace CNPM_TTN.Services
{
    public class UserService : IUserService
    {
        private readonly IRepository<User> _userRepository;

        public UserService(IRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<UserDto>> GetUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users
                .OrderBy(user => user.Name)
                .Select(MapToDto);
        }

        public async Task<UserDto?> GetUserByIdAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user == null ? null : MapToDto(user);
        }

        public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto dto)
        {
            var userName = dto.UserName.Trim();
            var email = dto.Email.Trim();

            var duplicateUsers = await _userRepository.FindAsync(user =>
                user.UserName == userName || user.Email == email);

            if (duplicateUsers.Any())
            {
                return ApiResponse<UserDto>.FailureResponse("Ten dang nhap hoac email da ton tai");
            }

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = dto.Name.Trim(),
                UserName = userName,
                Email = email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Salt = RandomNumberGenerator.GetBytes(16),
                Phone = dto.Phone,
                Position = dto.Position,
                Contact = dto.Contact,
                Image = dto.Image,
                UserType = dto.UserType,
                IsActive = true,
                Created = DateTime.Now
            };

            await _userRepository.AddAsync(user);
            return ApiResponse<UserDto>.SuccessResponse(MapToDto(user), "Tao nguoi dung thanh cong");
        }

        public async Task<ApiResponse<string>> UpdateUserAsync(string id, UpdateUserDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<string>.FailureResponse("Khong tim thay nguoi dung");
            }

            user.Name = dto.Name.Trim();
            user.Email = dto.Email.Trim();
            user.Phone = dto.Phone;
            user.Position = dto.Position;
            user.Contact = dto.Contact;
            user.Image = dto.Image;
            user.IsActive = dto.IsActive;
            user.UserType = dto.UserType;

            await _userRepository.UpdateAsync(user);
            return ApiResponse<string>.SuccessResponse(null, "Cap nhat nguoi dung thanh cong");
        }

        public async Task<ApiResponse<string>> DeleteUserAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<string>.FailureResponse("Khong tim thay nguoi dung");
            }

            await _userRepository.DeleteAsync(user);
            return ApiResponse<string>.SuccessResponse(null, "Xoa nguoi dung thanh cong");
        }

        public async Task<ApiResponse<string>> UpdateProfileAsync(string id, UpdateProfileDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<string>.FailureResponse("Khong tim thay nguoi dung");
            }

            user.Name = dto.Name.Trim();
            user.Email = dto.Email.Trim();
            user.Phone = dto.Phone;
            user.Contact = dto.Contact;
            if (!string.IsNullOrEmpty(dto.Image))
            {
                user.Image = dto.Image;
            }

            await _userRepository.UpdateAsync(user);
            return ApiResponse<string>.SuccessResponse(null, "Cap nhat ho so ca nhan thanh cong");
        }

        public async Task<ApiResponse<string>> ChangePasswordAsync(string id, ChangePasswordDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<string>.FailureResponse("Khong tim thay nguoi dung");
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
            {
                return ApiResponse<string>.FailureResponse("Mat khau hien tai khong chinh xac");
            }

            // Hash and update new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _userRepository.UpdateAsync(user);

            return ApiResponse<string>.SuccessResponse(null, "Thay doi mat khau thanh cong");
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                UserName = user.UserName,
                Email = user.Email,
                Phone = user.Phone,
                Position = user.Position,
                Contact = user.Contact,
                Image = user.Image,
                IsActive = user.IsActive,
                UserType = user.UserType,
                Created = user.Created
            };
        }
    }
}
