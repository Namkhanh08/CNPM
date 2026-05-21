using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IInventoryRepository
    {
       
        Task<IEnumerable<RawMaterial>> GetAllRawMaterialsAsync();
        Task<IEnumerable<object>> GetInventoryReceiptsAsync();
        Task<bool> ImportRawMaterialAsync(int rawMaterialId, string supplier, double quantity, DateTime importDate, DateTime expiryDate, string userId);

      
        Task<IEnumerable<Product>> GetAllProductAsync();
        Task<IEnumerable<object>> GetRawMaterialLogsAsync();
        Task<IEnumerable<object>> GetRoastingBatchesAsync();
        Task<InventoryResult> CreateRoastingBatchAsync(int productId, int inventoryReceiptId, string batchCode, string roastLevel, double inputWeight, string status, double? outputWeight, string userId);
        Task<double> GetTotalQuantityAsync();
        Task<InventoryResult> UpdateBatchStatusAsync(int batchId, string newStatus, double? outputWeight, string userId);
        
    }
}
