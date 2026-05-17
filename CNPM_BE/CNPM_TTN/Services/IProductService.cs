using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IProductService
    {
        Task<(IEnumerable<ProductDto> Items, int TotalCount)> GetProductsAsync(string? searchTerm, int page, int pageSize);
        Task<ProductDetailDto?> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<bool> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<bool> DeleteProductAsync(int id);
    }
}
