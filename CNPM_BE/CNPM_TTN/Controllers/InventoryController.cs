using System.Security.Claims;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet("products")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _inventoryService.GetProductsAsync();
            return Ok(ApiResponse<IEnumerable<ProductDto>>.SuccessResponse(products));
        }

        [HttpPost("update-stock")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> UpdateStock([FromBody] UpdateStockDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(ApiResponse<string>.FailureResponse("Token khong hop le"));
            }

            var result = await _inventoryService.UpdateStockAsync(dto, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("logs")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _inventoryService.GetInventoryLogsAsync();
            return Ok(ApiResponse<IEnumerable<InventoryLogDto>>.SuccessResponse(logs));
        }

        [HttpPost("create-batch-detail")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> CreateBatchDetail([FromBody] CreateRoastingBatchDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(ApiResponse<string>.FailureResponse("Token khong hop le"));
            }

            var result = await _inventoryService.CreateRoastingBatchAsync(dto, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("batches")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> GetBatches()
        {
            var batches = await _inventoryService.GetRoastingBatchesAsync();
            return Ok(ApiResponse<IEnumerable<RoastingBatchDto>>.SuccessResponse(batches));
        }

        [HttpGet("total-stock")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> GetTotalStock()
        {
            var totalStock = await _inventoryService.GetTotalStockAsync();
            return Ok(ApiResponse<object>.SuccessResponse(new { TotalWeight = totalStock }));
        }
    }
}
