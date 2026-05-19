using CNPM_TTN.Dtos; 
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/admin/products")]
    [Authorize(Roles = "1")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _productRepo;
        public ProductController(IProductRepository productRepo) { _productRepo = productRepo; }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _productRepo.GetAllProductsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepo.GetProductByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

       
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductRequest request)
        {
            var result = await _productRepo.AddProductAsync(request);
            if (!result) return BadRequest(new { Success = false, Message = "Thêm thất bại" });
            return Ok(new { Success = true, Message = "Thêm thành công" });
        }

   
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductRequest request)
        {
            if (id != request.Id) return BadRequest();
            var result = await _productRepo.UpdateProductAsync(request);
            if (!result) return BadRequest(new { Success = false, Message = "Cập nhật thất bại" });
            return Ok(new { Success = true, Message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productRepo.DeleteProductAsync(id);
            if (!result) return BadRequest(new { Success = false, Message = "Xóa thất bại" });
            return Ok(new { Success = true, Message = "Xóa thành công" });
        }
    }
}
