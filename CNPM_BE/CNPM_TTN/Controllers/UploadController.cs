using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IUploadService _uploadService;

        public UploadController(IUploadService uploadService)
        {
            _uploadService = uploadService;
        }

        [HttpPost("user-image")]
        public async Task<IActionResult> UploadUserImage(IFormFile file)
        {
            var result = await _uploadService.UploadUserImageAsync(file);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("product-image")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> UploadProductImage(IFormFile file)
        {
            var result = await _uploadService.UploadProductImageAsync(file);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
