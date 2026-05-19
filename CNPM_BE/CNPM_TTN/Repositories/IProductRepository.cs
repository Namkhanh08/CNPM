using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<object>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<bool> AddProductAsync(ProductRequest request);
        Task<bool> UpdateProductAsync(ProductRequest request);
        Task<bool> DeleteProductAsync(int id);

      
    }
}