using CNPM_TTN.Data;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;
using System;

namespace CNPM_TTN.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<ApiResponse<string>> RegisterAsync(RegisterRequest request)
        {

            if (await _context.Users.AnyAsync(u => u.UserName == request.UserName))
            {
                return ApiResponse<string>.FailureResponse("Tên đăng nhập đã tồn tại");
            }


            var newUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                UserName = request.UserName,
                Email = request.Email,
                UserType = request.UserType,
                IsActive = true,
                Created = DateTime.Now,
                Salt = Guid.NewGuid().ToString().Substring(0, 8),
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(null, "Đăng ký thành công");
        }

        public async Task<ApiResponse<object>> LoginAsync(LoginRequest request)
        {

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName);


            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return ApiResponse<object>.FailureResponse("Tài khoản hoặc mật khẩu không đúng");
            }


            var secretKey = _configuration["Jwt:Key"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            var token = TokenHelper.GenerateJwtToken(
                user.Id,
                user.UserName,
                user.UserType.ToString(),
                secretKey,
                issuer,
                audience
            );


            var loginData = new
            {
                success = true,
                message = "Đăng nhập thành công",
                data = token,
                userId = user.Id,
                userName = user.UserName,
                name = user.Name,
                userType = user.UserType
            };

            return ApiResponse<object>.SuccessResponse(loginData, "Đăng nhập thành công");
        }
    }
}