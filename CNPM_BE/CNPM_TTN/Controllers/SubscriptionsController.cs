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
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionsController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        [HttpGet]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _subscriptionService.GetByUserAsync(userId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<SubscriptionDto>.FailureResponse("Dữ liệu đăng ký không hợp lệ."));
            }

            var result = await _subscriptionService.CreateAsync(userId, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id}/pause")]
        public async Task<IActionResult> Pause(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _subscriptionService.PauseAsync(id, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpPut("{id}/resume")]
        public async Task<IActionResult> Resume(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _subscriptionService.ResumeAsync(id, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _subscriptionService.CancelAsync(id, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Endpoint test chạy bằng tay để trigger processing các đơn hàng đến hạn
        [HttpPost("process-due")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> ProcessDue()
        {
            await _subscriptionService.ProcessDueSubscriptionsAsync();
            return Ok(ApiResponse<string>.SuccessResponse("Đã chạy xử lý subscription thành công."));
        }

        [HttpGet("admin")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> GetAllForAdmin([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null, [FromQuery] string? searchTerm = null)
        {
            var result = await _subscriptionService.GetAllForAdminAsync(page, pageSize, status, searchTerm);
            return Ok(result);
        }

        [HttpPut("admin/{id}/status")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> AdminUpdateStatus(int id, [FromBody] SubscriptionStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<string>.FailureResponse("Dữ liệu không hợp lệ."));
            }

            var result = await _subscriptionService.AdminUpdateStatusAsync(id, dto.Status);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
