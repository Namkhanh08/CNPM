using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<object>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<bool> AddProductAsync(Product product);
        Task<bool> UpdateProductAsync(Product product);
        Task<bool> DeleteProductAsync(int id);
    }
}