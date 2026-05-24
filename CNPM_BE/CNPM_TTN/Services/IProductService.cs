using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IProductService
    {
        Task<(IEnumerable<ProductDto> Items, int TotalCount)> GetProductsAsync(ProductFilterDto filterDto);
        Task<IEnumerable<string>> GetRegionsAsync();
        Task<ProductDetailDto?> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<bool> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<bool> DeleteProductAsync(int id);
        Task<TraceabilityResultDto?> GetProductTraceabilityAsync(int productId);
        Task<TraceabilityResultDto?> GetBatchTraceabilityAsync(string batchCode);
    }
}
