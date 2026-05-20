using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.Extensions.Configuration;

namespace CNPM_TTN.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IRepository<User> userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<ApiResponse<string>> RegisterAsync(RegisterRequest request)
        {
            var name = request.Name.Trim();
            var userName = request.UserName.Trim();
            var email = request.Email.Trim();
            var password = request.Password;

            if (string.IsNullOrWhiteSpace(name) ||
                string.IsNullOrWhiteSpace(userName) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password))
            {
                return ApiResponse<string>.FailureResponse("Vui lòng nhập đầy đủ thông tin đăng ký");
            }

            if (request.UserType != 0)
            {
                return ApiResponse<string>.FailureResponse("Khong the tao tai khoan quan tri tu endpoint dang ky cong khai");
            }

            var existingUserByUsername = await _userRepository.FindAsync(u => u.UserName == userName);
            if (existingUserByUsername.Any())
            {
                return ApiResponse<string>.FailureResponse("Tên đăng nhập đã tồn tại");
            }

            var existingUserByEmail = await _userRepository.FindAsync(u => u.Email == email);
            if (existingUserByEmail.Any())
            {
                return ApiResponse<string>.FailureResponse("Email đã được sử dụng");
            }

            var newUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = name,
                UserName = userName,
                Email = email,
                UserType = 0,
                IsActive = true,
                Created = DateTime.Now,
                Salt = RandomNumberGenerator.GetBytes(16),
                Password = BCrypt.Net.BCrypt.HashPassword(password),
                Contact = string.Empty,
                Phone = string.Empty,
                Position = "User",
                Image = string.Empty
            };

            try
            {
                await _userRepository.AddAsync(newUser);
            }
            catch (Exception)
            {
                return ApiResponse<string>.FailureResponse("Không thể tạo tài khoản. Vui lòng kiểm tra lại cấu hình hệ thống.");
            }

            return ApiResponse<string>.SuccessResponse(null, "Đăng ký thành công");
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequest request)
        {
            var loginName = !string.IsNullOrWhiteSpace(request.UserName)
                ? request.UserName.Trim()
                : (!string.IsNullOrWhiteSpace(request.Email) ? request.Email.Trim() : string.Empty);

            if (string.IsNullOrWhiteSpace(loginName) || string.IsNullOrWhiteSpace(request.Password))
            {
                return new LoginResponseDto { Success = false, Message = "Vui lòng nhập tài khoản và mật khẩu" };
            }

            var normalizedLoginName = loginName.ToLower();
            var users = await _userRepository.FindAsync(u =>
                u.UserName.ToLower() == normalizedLoginName || u.Email.ToLower() == normalizedLoginName);
            var user = users.FirstOrDefault();

            if (user == null || !IsPasswordValid(request.Password, user.Password))
            {
                return new LoginResponseDto { Success = false, Message = "Tài khoản hoặc mật khẩu không đúng" };
            }

            var secretKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key configuration.");
            var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Missing Jwt:Issuer configuration.");
            var audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Missing Jwt:Audience configuration.");

            var token = TokenHelper.GenerateJwtToken(user.Id, user.UserName, user.UserType.ToString(), secretKey, issuer, audience);

            return new LoginResponseDto
            {
                Success = true,
                Message = "Đăng nhập thành công",
                Data = token,
                UserId = user.Id,
                UserName = user.UserName,
                UserType = user.UserType
            };
        }

        private static bool IsPasswordValid(string password, string storedPassword)
        {
            if (string.IsNullOrEmpty(storedPassword))
            {
                return false;
            }

            if (storedPassword.StartsWith("$2a$") ||
                storedPassword.StartsWith("$2b$") ||
                storedPassword.StartsWith("$2x$") ||
                storedPassword.StartsWith("$2y$"))
            {
                return BCrypt.Net.BCrypt.Verify(password, storedPassword);
            }

            return password == storedPassword;
        }
    }
}
