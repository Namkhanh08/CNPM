using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/admin/products")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? searchTerm,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
            {
                return BadRequest(ApiResponse<string>.FailureResponse("Page và pageSize phải lớn hơn 0"));
            }

            var result = await _productService.GetProductsAsync(searchTerm, page, pageSize);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                result.Items,
                result.TotalCount,
                Page = page,
                PageSize = pageSize
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound(ApiResponse<string>.FailureResponse("Không tìm thấy sản phẩm"));
            }

            return Ok(ApiResponse<ProductDetailDto>.SuccessResponse(product));
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var product = await _productService.CreateProductAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = product.Id },
                ApiResponse<ProductDto>.SuccessResponse(product, "Thêm sản phẩm thành công"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            var result = await _productService.UpdateProductAsync(id, dto);
            if (!result)
            {
                return NotFound(ApiResponse<string>.FailureResponse("Không tìm thấy sản phẩm"));
            }

            return Ok(ApiResponse<string>.SuccessResponse(null, "Cập nhật sản phẩm thành công"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<string>.FailureResponse("Không tìm thấy sản phẩm"));
            }

            return Ok(ApiResponse<string>.SuccessResponse(null, "Xóa sản phẩm thành công"));
        }
    }
}
