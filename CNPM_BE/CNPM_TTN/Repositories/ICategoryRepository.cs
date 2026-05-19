using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
    }
}
