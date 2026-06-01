using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IInventoryRepository
    {
       
        Task<IEnumerable<RawMaterial>> GetAllRawMaterialsAsync();
        Task<PagedResultDto<object>> GetInventoryReceiptsAsync(int page,int pageSize,string? search,string? status);
        Task<IEnumerable<object>> GetAvailableReceiptsAsync();
        Task<bool> ImportRawMaterialAsync(int rawMaterialId, string supplier, double quantity, DateTime importDate, DateTime expiryDate, string userId);
        Task<bool> CreateRawMaterialAsync(string name, string unit, int categoryId);



        Task<IEnumerable<Product>> GetAllProductAsync();
        Task<PagedResultDto<object>> GetRawMaterialLogsAsync(int page,int pageSize,string? search,string? action);
        Task<PagedResultDto<object>> GetRoastingBatchesAsync(int page,int pageSize,string? search,string? status);
        Task<InventoryResult> CreateRoastingBatchAsync(int productId, int inventoryReceiptId, string batchCode, string roastLevel, double inputWeight, string status, double? outputWeight, string userId);
        Task<double> GetTotalQuantityAsync();
        Task<InventoryResult> UpdateBatchStatusAsync(int batchId, string newStatus, double? outputWeight, string userId);
        
    }
}
