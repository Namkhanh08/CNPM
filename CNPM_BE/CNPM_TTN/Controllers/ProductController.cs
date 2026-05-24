using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace CNPM_TTN.Controllers
{
    [Route("api/admin/products")]
    [Authorize(Roles = "1")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filterDto)
        {
            if (filterDto.Page < 1 || filterDto.PageSize < 1)
            {
                return BadRequest(ApiResponse<string>.FailureResponse("Page và pageSize phải lớn hơn 0"));
            }

            var result = await _productService.GetProductsAsync(filterDto);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                result.Items,
                result.TotalCount,
                filterDto.Page,
                filterDto.PageSize
            }));
        }

        [HttpGet("regions")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRegions()
        {
            var regions = await _productService.GetRegionsAsync();
            return Ok(ApiResponse<IEnumerable<string>>.SuccessResponse(regions));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound(ApiResponse<string>.FailureResponse("Không tìm thấy sản phẩm"));
            }

            return new JsonResult(product, new JsonSerializerOptions
            {
                PropertyNamingPolicy = null
            });
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

        [HttpGet("{id}/traceability")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTraceability(int id)
        {
            var result = await _productService.GetProductTraceabilityAsync(id);
            if (result == null)
            {
                return NotFound(ApiResponse<string>.FailureResponse("Không tìm thấy thông tin truy xuất nguồn gốc của sản phẩm này"));
            }

            return Ok(ApiResponse<TraceabilityResultDto>.SuccessResponse(result));
        }

        [HttpGet("/api/traceability/batch/{batchCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBatchTraceability(string batchCode)
        {
            var result = await _productService.GetBatchTraceabilityAsync(batchCode);
            if (result == null)
            {
                return NotFound(ApiResponse<string>.FailureResponse("Không tìm thấy thông tin truy xuất nguồn gốc của lô rang này"));
            }

            return Ok(ApiResponse<TraceabilityResultDto>.SuccessResponse(result));
        }
    }
}
