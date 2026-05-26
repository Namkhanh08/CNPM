using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("api/vouchers")]
    public class VouchersController : ControllerBase
    {
        private readonly VoucherService _voucherService;

        public VouchersController(VoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet]
        public IActionResult GetAllVouchersForDashboard(
            [FromQuery] int page = 1,
            [FromQuery] string searchTerm = "",
            [FromQuery] string status = "all")
        {
            var data = _voucherService.GetVouchersAdminPaged(page, searchTerm, status);
            return Ok(data);
        }

        [HttpPost("available")]
        public IActionResult GetAvailableVouchers([FromBody] VoucherEligibilityRequest request)
        {
            var vouchers = _voucherService.GetEligibleVouchers(request);
            return Ok(vouchers);
        }

        [HttpGet("public")]
        [AllowAnonymous] // Riêng API này cho phép khách vãng lai xem voucher chung
        public IActionResult GetPublicVouchers()
        {
            return Ok(_voucherService.GetPublicVouchers());
        }

        [HttpPost]
        public IActionResult CreateVoucher([FromBody] CreateVoucherRequest request)
        {
            _voucherService.CreateVoucher(request);
            return Ok(new { message = "Tạo voucher thành công" });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateVoucher(int id, [FromBody] CreateVoucherRequest request)
        {
            _voucherService.UpdateVoucher(id, request);
            return Ok(new { message = "Cập nhật voucher thành công" });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteVoucher(int id)
        {
            _voucherService.DeleteVoucher(id);
            return Ok(new { message = "Xóa voucher thành công" });
        }

        [HttpPatch("{id}/toggle")]
        public IActionResult ToggleVoucher(int id, [FromQuery] bool active)
        {
            _voucherService.ToggleVoucher(id, active);
            return Ok(new { message = "Cập nhật trạng thái thành công" });
        }
    }
}