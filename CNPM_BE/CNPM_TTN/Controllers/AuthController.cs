using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;

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
            if (await _context.Users.AnyAsync(u => u.UserName == request.UserName))
            {
                return BadRequest(ApiResponse<string>.FailureResponse("Tên đăng nhập đã tồn tại"));
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

            return Ok(ApiResponse<string>.SuccessResponse(null, "Đăng ký thành công"));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized(ApiResponse<string>.FailureResponse("Tài khoản hoặc mật khẩu không đúng"));
            }

            var secretKey = _configuration["Jwt:Key"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

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
    }
}