using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
   
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryRepository _inventoryRepo;

        public InventoryController(IInventoryRepository inventoryRepo)
        {
            _inventoryRepo = inventoryRepo;
        }

        [HttpGet("products")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _inventoryRepo.GetAllProductAsync();
            return Ok(new { data = products });
        }

        [HttpGet("raw-materials")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetRawMaterials()
        {
            var materials = await _inventoryRepo.GetAllRawMaterialsAsync();
            return Ok(new { data = materials });
        }


        [HttpGet("receipts")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetInventoryReceipts()
        {
            var receipts = await _inventoryRepo.GetInventoryReceiptsAsync();
            return Ok(new { data = receipts });
        }


        [HttpPost("import-material")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> ImportMaterial([FromBody] ImportMaterialRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            var result = await _inventoryRepo.ImportRawMaterialAsync(
                request.RawMaterialId,
                request.Supplier,
                request.Quantity,
                request.ImportDate,
                request.ExpiryDate,
                userId
            );

            if (!result) return BadRequest("Nhập kho lô nguyên liệu mới thất bại. Vui lòng kiểm tra lại dữ liệu hợp lệ!");
            return Ok(new { message = "Nhập kho nguyên liệu thành công" });
        }

        [HttpGet("logs")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _inventoryRepo.GetRawMaterialLogsAsync();
            return Ok(new { data = logs });
        }

        [HttpPost("create-batch-detail")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> CreateBatchDetail([FromBody] CreateBatchRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

           
            var result = await _inventoryRepo.CreateRoastingBatchAsync(
                request.ProductId,
                request.InventoryReceiptId,
                request.BatchCode,
                request.RoastLevel,
                request.InputWeight,
                request.Status,
                request.OutputWeight,
                userId
            );

            if (!result.Success) return BadRequest(result.Message);
            return Ok(new { message = result.Message });
        }

        [HttpGet("batches")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetBatches()
        {
            var batches = await _inventoryRepo.GetRoastingBatchesAsync();
            return Ok(new { data = batches });
        }

        [HttpGet("total-stock")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetTotalStock()
        {
            var totalWeight = await _inventoryRepo.GetTotalQuantityAsync();
            return Ok(new { TotalWeight = totalWeight });
        }

        [HttpPut("update-batch-status/{id}")]
        [Authorize(Roles = "1,3")]
        public async Task<IActionResult> UpdateBatchStatus(int id, [FromBody] UpdateBatchStatusRequest request)
        {
            if (string.IsNullOrEmpty(request.Status)) return BadRequest("Trạng thái không được để trống");

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

            var result = await _inventoryRepo.UpdateBatchStatusAsync(id, request.Status, request.OutputWeight, userId);

            if (!result.Success) return BadRequest(result.Message); 
            return Ok(new { message = result.Message });
        }
    }

    
}