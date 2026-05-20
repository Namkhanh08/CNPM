using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;

namespace CNPM_TTN.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IRepository<Category> _categoryRepository;

        public CategoryService(IRepository<Category> categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name
                });
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim() ?? string.Empty
            };

            await _categoryRepository.AddAsync(category);

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            };
        }
    }
}
