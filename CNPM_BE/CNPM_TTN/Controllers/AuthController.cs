using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using System.Security.Cryptography;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
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
                return BadRequest(ApiResponse<string>.FailureResponse("Vui lòng nhập đầy đủ thông tin đăng ký"));
            }

            if (await _context.Users.AnyAsync(u => u.UserName == userName))
            {
                return BadRequest(ApiResponse<string>.FailureResponse("Tên đăng nhập đã tồn tại"));
            }

            var newUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = name,
                UserName = userName,
                Email = email,
                UserType = request.UserType,
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
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, ApiResponse<string>.FailureResponse("Không thể tạo tài khoản. Vui lòng kiểm tra cấu hình database."));
            }

            return Ok(ApiResponse<string>.SuccessResponse(null, "Đăng ký thành công"));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var loginName = !string.IsNullOrWhiteSpace(request.UserName)
                ? request.UserName.Trim()
                : request.Email.Trim();
            var password = request.Password;

            if (string.IsNullOrWhiteSpace(loginName) || string.IsNullOrWhiteSpace(password))
            {
                return BadRequest(ApiResponse<string>.FailureResponse("Vui lòng nhập tài khoản và mật khẩu"));
            }

            var normalizedLoginName = loginName.ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.UserName.ToLower() == normalizedLoginName || u.Email.ToLower() == normalizedLoginName);

            if (user == null || !IsPasswordValid(password, user.Password))
            {
                return Unauthorized(ApiResponse<string>.FailureResponse("Tài khoản hoặc mật khẩu không đúng"));
            }

            var secretKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key configuration.");
            var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Missing Jwt:Issuer configuration.");
            var audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Missing Jwt:Audience configuration.");

            var token = TokenHelper.GenerateJwtToken(user.Id, user.UserName, user.UserType.ToString(), secretKey, issuer, audience);

            return Ok(new
            {
                success = true,
                message = "Đăng nhập thành công",
                data = token,
                userId = user.Id,
                userName = user.UserName,
                userType = user.UserType
            });
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
