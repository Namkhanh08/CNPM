using System.Security.Claims;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class LoyaltyController : ControllerBase
    {
        private readonly ILoyaltyService _loyaltyService;

        public LoyaltyController(ILoyaltyService loyaltyService)
        {
            _loyaltyService = loyaltyService;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        [HttpGet]
        public async Task<IActionResult> GetLoyaltyInfo()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _loyaltyService.GetLoyaltyInfoAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("redeem")]
        public async Task<IActionResult> RedeemPoints([FromBody] RedeemPointsDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<VoucherDto>.FailureResponse("Số điểm quy đổi không hợp lệ."));
            }

            var result = await _loyaltyService.RedeemPointsAsync(userId, dto.Points);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
