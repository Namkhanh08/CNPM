using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IInventoryRepository
    {
        // Quản lý kho nguyên liệu thô 
        Task<IEnumerable<RawMaterial>> GetAllRawMaterialsAsync();
        Task<IEnumerable<object>> GetInventoryReceiptsAsync();
        Task<bool> ImportRawMaterialAsync(int rawMaterialId, string supplier, double quantity, DateTime importDate, DateTime expiryDate, string userId);

        // Quản lý kho thành phẩm & logs & mẻ rang 
        Task<IEnumerable<Product>> GetAllProductAsync();
        Task<IEnumerable<object>> GetRawMaterialLogsAsync();
        Task<IEnumerable<object>> GetRoastingBatchesAsync();
        Task<bool> CreateRoastingBatchAsync(int productId, int inventoryReceiptId, string batchCode, string roastLevel, double inputWeight, string status, string userId);
        Task<double> GetTotalQuantityAsync();
        Task<bool> UpdateBatchStatusAsync(int batchId, string newStatus, string userId);
    }
}
