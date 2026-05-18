using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IInventoryRepository
    {
        Task<IEnumerable<Product>> GetAllProductAsync();
        Task<bool> UpdateStockAsync(int productId, int quantity, string userId, string reason);
        Task<IEnumerable<object>> GetInventoryLogsAsync(); 
        Task<IEnumerable<object>> GetRoastingBatchesAsync();
        Task<bool> CreateRoastingBatchAsync(int productId, string batchCode, string roastLevel, double inputWeight, string status, string userId);
        Task<double> GetTotalQuantityAsync();
    }
}
