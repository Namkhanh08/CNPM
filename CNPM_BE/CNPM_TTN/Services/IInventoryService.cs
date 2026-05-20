using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IInventoryService
    {
        Task<IEnumerable<ProductDto>> GetProductsAsync();
        Task<ApiResponse<string>> UpdateStockAsync(UpdateStockDto dto, string userId);
        Task<IEnumerable<InventoryLogDto>> GetInventoryLogsAsync();
        Task<ApiResponse<string>> CreateRoastingBatchAsync(CreateRoastingBatchDto dto, string userId);
        Task<IEnumerable<RoastingBatchDto>> GetRoastingBatchesAsync();
        Task<int> GetTotalStockAsync();
    }
}
