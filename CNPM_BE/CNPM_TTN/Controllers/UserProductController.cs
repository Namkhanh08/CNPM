using CNPM_TTN.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("products")] 
    [ApiController]
    public class UserProductController : ControllerBase
    {
        private readonly IProductRepository _productRepo;

        public UserProductController(IProductRepository productRepo)
        {
            _productRepo = productRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
        {
            var products = await _productRepo.GetAllProductsForUserAsync(categoryId);
            return Ok(products);
        }

       
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepo.GetProductDetailForUserAsync(id);
            if (product == null) return NotFound(new { Message = "Sản phẩm không tồn tại hoặc đã bị xóa." });

            return Ok(product);
        }
    }
}