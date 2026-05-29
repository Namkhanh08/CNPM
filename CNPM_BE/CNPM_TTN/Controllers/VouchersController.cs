using System.Threading.Tasks;
using System.Security.Claims;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VouchersController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VouchersController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        // Khách hàng validate voucher
        [HttpGet("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateVoucher([FromQuery] string code, [FromQuery] decimal total)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(ApiResponse<VoucherValidateResponseDto>.FailureResponse("Mã voucher không được để trống."));
            }

            var result = await _voucherService.ValidateAsync(code.Trim().ToUpper(), total, userId: GetCurrentUserId());
            return Ok(result);
        }

        [HttpPost("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateVoucherPost([FromBody] VoucherValidateRequestDto dto)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(dto.Code))
            {
                return BadRequest(ApiResponse<VoucherValidateResponseDto>.FailureResponse("Mã voucher không được để trống."));
            }

            var result = await _voucherService.ValidateAsync(dto.Code, dto.OrderTotal, dto.PaymentMethod, GetCurrentUserId(), dto.ProductIds);
            return Ok(result);
        }

        [HttpGet("available")]
        [Authorize]
        public async Task<IActionResult> GetAvailable([FromQuery] decimal total = 0, [FromQuery] string? paymentMethod = null, [FromQuery] string? productIds = null)
        {
            var result = await _voucherService.GetAvailableAsync(total, paymentMethod, GetCurrentUserId(), ParseProductIds(productIds));
            return Ok(result);
        }

        private static List<int> ParseProductIds(string? productIds)
        {
            if (string.IsNullOrWhiteSpace(productIds))
            {
                return new List<int>();
            }

            return productIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(item => int.TryParse(item, out var id) ? id : 0)
                .Where(id => id > 0)
                .Distinct()
                .ToList();
        }

        // Admin lấy danh sách vouchers
        [HttpGet]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _voucherService.GetAllAsync();
            return Ok(result);
        }

        // Admin tạo voucher mới
        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> Create([FromBody] CreateVoucherDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<VoucherDto>.FailureResponse("Dữ liệu không hợp lệ."));
            }

            var result = await _voucherService.CreateAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Admin cập nhật voucher
        [HttpPut("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateVoucherDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<string>.FailureResponse("Dữ liệu không hợp lệ."));
            }

            var result = await _voucherService.UpdateAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Admin xóa voucher
        [HttpDelete("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _voucherService.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
