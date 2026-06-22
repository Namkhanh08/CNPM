using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<object>> GetAllProductsAsync(ProductFilterRequest filter);
        Task<Product?> GetProductByIdAsync(int id);
        Task<bool> AddProductAsync(ProductRequest request);
        Task<bool> UpdateProductAsync(ProductRequest request);
        Task<bool> DeleteProductAsync(int id);


        // Hàm dành cho User
        Task<IEnumerable<ProductUserResponse>> GetAllProductsForUserAsync(int? categoryId = null);
        Task<ProductUserResponse?> GetProductDetailForUserAsync(int id);

       
    }
}