using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto);
    }
}
