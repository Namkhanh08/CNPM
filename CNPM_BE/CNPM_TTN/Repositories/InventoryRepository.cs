using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;


namespace CNPM_TTN.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly ApplicationDbContext _context;

        public InventoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllProductAsync()
        {
            
            return await _context.Products.ToListAsync();
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantity, string userId, string reason)
        {
            var user = await _context.Users.FindAsync(userId);
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return false;

            int oldQty = product.Stock;
            product.Stock += quantity;

            // 2. Ghi nhật ký vào bảng InventoryLog
            var log = new InventoryLog
            {
                ProductId = productId,
                
                Action = quantity > 0 ? "NHAP_KHO" : "XUAT_KHO",
                OldQuantity = oldQty,
                NewQuantity = product.Stock,
                UserId = userId,
                ModifiedBy = user?.UserName ?? "Hệ thống",
                ModifiedDate = DateTime.Now,
            };

            _context.InventoryLogs.Add(log);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<object>> GetInventoryLogsAsync()
        {
            return await _context.InventoryLogs
                 .Include(x => x.User)
                 .Include(l => l.Product)
                 .OrderByDescending(x => x.ModifiedDate)
                 .Select(log => new
                 {
                     log.Id,
                     ProductName = log.Product.Name, 
                     log.Action,
                     log.OldQuantity,
                     log.NewQuantity,
                     QuantityChange = log.NewQuantity - log.OldQuantity,
                     ModifiedBy = log.User.Name ?? "Hệ thống",
                     log.ModifiedDate
                 })
                 .Take(20) 
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetRoastingBatchesAsync()
        {
            return await _context.RoastingBatches
                .Include(b => b.User)
                .Include(b => b.Product)
                .OrderByDescending(x => x.RoastDate)
                .Select(batch => new
                {
                    Id = batch.Id,
                    BatchCode = batch.BatchCode,
                    // Lấy trực tiếp từ bảng Product đã liên kết
                    ProductName = batch.Product.Name,
                    RoastLevel = batch.RoastLevel,
                    Weight = batch.InputWeight,
                    RoasterName = batch.User.Name ?? "N/A",
                    Status = batch.Status,
                    Date = batch.RoastDate
                })
                .ToListAsync();
        }

        public async Task<bool> CreateRoastingBatchAsync(int productId, string batchCode, string roastLevel, double inputWeight, string status, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.Users.FindAsync(userId);
                var product = await _context.Products.FindAsync(productId);
                if (product == null) return false;
                if (product.Stock < inputWeight)
                {
                    return false;
                }
                int oldQty = product.Stock;
                product.Stock -= (int)inputWeight;
                var newBatch = new RoastingBatch
                {
                    ProductId = productId,
                    BatchCode = batchCode,
                    RoastLevel = roastLevel,
                    InputWeight = inputWeight,
                    Status = status,
                    UserId = userId,
                    RoastDate = DateTime.Now
                };
                var log = new InventoryLog
                {
                    ProductId = productId,
                    Action = "RANG_CA_PHE", 
                    OldQuantity = oldQty,
                    NewQuantity = product.Stock,
                    UserId = userId,
                    ModifiedBy = user?.UserName ?? "Hệ thống",
                    ModifiedDate = DateTime.Now
                };
                _context.RoastingBatches.Add(newBatch);
                _context.InventoryLogs.Add(log);
                var success = await _context.SaveChangesAsync() > 0;
                if (success)
                {
                    await transaction.CommitAsync();
                    return true;
                }

                return false;
            }
            catch (Exception)
            {          
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<double> GetTotalQuantityAsync()
        {
            return await _context.Products.SumAsync(p => p.Stock);
        }
    }
}
