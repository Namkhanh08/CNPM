using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CNPM_TTN.Services;
using CNPM_TTN.Dtos;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _productService.GetProductsAsync(search, page, pageSize);
            return Ok(new { Items = result.Items, TotalCount = result.TotalCount, Page = page, PageSize = pageSize });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound(new { message = "Sản phẩm không tồn tại" });
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var createdProduct = await _productService.CreateProductAsync(dto);
            return CreatedAtAction(nameof(GetProductById), new { id = createdProduct.Id }, createdProduct);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            var result = await _productService.UpdateProductAsync(id, dto);
            if (!result) return NotFound(new { message = "Sản phẩm không tồn tại" });
            return NoContent(); // 204 No Content
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result) return NotFound(new { message = "Sản phẩm không tồn tại" });
            return NoContent();
        }
    }
}