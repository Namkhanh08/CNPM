using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryService.GetCategoriesAsync();
            return Ok(ApiResponse<IEnumerable<CategoryDto>>.SuccessResponse(categories));
        }

        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            var category = await _categoryService.CreateCategoryAsync(dto);
            return Ok(ApiResponse<CategoryDto>.SuccessResponse(category, "Tao danh muc thanh cong"));
        }
    }
}
