using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("vouchers")] 
    public class VouchersController : ControllerBase
    {
        private readonly IVoucherService _service;

        public VouchersController(IVoucherService service)
        {
            _service = service;
        }

      
        [HttpGet]
        public async Task<IActionResult> GetVouchersAdmin(
            [FromQuery] int page = 1,
            [FromQuery] string searchTerm = "",
            [FromQuery] string status = "all")
        {
            var result = await _service.GetVouchersAdminAsync(page, searchTerm, status);
            return Ok(result);
        }

      
        [HttpPost("available")]
        public async Task<IActionResult> GetAvailableVouchers([FromBody] CheckAvailableVoucherDto dto)
        {
            var result = await _service.GetAvailableVouchersAsync(dto);
            return Ok(result);
        }

        
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicVouchers()
        {
            var result = await _service.GetPublicVouchersAsync();
            return Ok(result);
        }

      
        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateUpdateVoucherDto dto)
        {
            var result = await _service.CreateVoucherAsync(dto);
            return CreatedAtAction(nameof(GetVouchersAdmin), new { id = result.Id }, result);
        }

       
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] CreateUpdateVoucherDto dto)
        {
            var success = await _service.UpdateVoucherAsync(id, dto);
            if (!success) return NotFound(new { message = "Không tìm thấy voucher để cập nhật" });
            return Ok(new { message = "Cập nhật thành công!" });
        }

        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var success = await _service.DeleteVoucherAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy voucher để xóa" });
            return Ok(new { message = "Xóa voucher thành công!" });
        }

        
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleVoucher(int id, [FromQuery] bool active)
        {
            var success = await _service.ToggleVoucherAsync(id, active);
            if (!success) return NotFound(new { message = "Không tìm thấy voucher" });
            return Ok(new { message = "Thay đổi trạng thái thành công!" });
        }
    }
}