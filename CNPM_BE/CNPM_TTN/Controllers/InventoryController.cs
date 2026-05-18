using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles ="1,3")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryRepository _inventoryRepo;

        public InventoryController(IInventoryRepository inventoryRepo)
        {
            _inventoryRepo = inventoryRepo;
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _inventoryRepo.GetAllProductAsync();
            return Ok(new { data = products });
        }

        [HttpPost("update-stock")]
        public async Task<IActionResult> UpdateStock(int productId, int quantity, string reason)
        {

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var result = await _inventoryRepo.UpdateStockAsync(productId, quantity, userId, reason);
            if (!result) return BadRequest("Cập nhật kho thất bại");

            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _inventoryRepo.GetInventoryLogsAsync();
            return Ok(new { data = logs });
        }

        [HttpPost("create-batch-detail")]
        public async Task<IActionResult> CreateBatchDetail(int productId, string batchCode, string roastLevel, double inputWeight, string status)
        {

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;


            var result = await _inventoryRepo.CreateRoastingBatchAsync(productId, batchCode, roastLevel, inputWeight, status, userId);

            if (!result) return BadRequest("Tạo mẻ rang thất bại");
            return Ok(new { message = "Tạo mẻ rang thành công" });
        }

        [HttpGet("batches")]
        public async Task<IActionResult> GetBatches()
        {
            var batches = await _inventoryRepo.GetRoastingBatchesAsync();
            return Ok(new { data = batches });
        }

        [HttpGet("total-stock")]
        public async Task<IActionResult> GetTotalStock()
        {
            var totalWeight = await _inventoryRepo.GetTotalQuantityAsync();

            return Ok(new { TotalWeight = totalWeight });
        }
    }


}
