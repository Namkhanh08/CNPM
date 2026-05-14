using KHE_AuthService.DTOs;
using KHE_AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace KHE_AuthService.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login(LoginRequest req)
        {
            var response = _authService.Login(req.UserName, req.Password);
            if(response == null)
            {
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu"});
            }
            return Ok(response);
        }
    }
}
