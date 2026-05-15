using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using CNPM_TTN.Dtos; 
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/admin/products")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _productRepo;

        public ProductController(IProductRepository productRepo)
        {
            _productRepo = productRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _productRepo.GetAllProductsAsync());

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productRepo.DeleteProductAsync(id);
            if (!result) return BadRequest(new { Success = false, Message = "Xóa thất bại" });
            return Ok(new { Success = true, Message = "Xóa thành công" });
        }
    }
}
