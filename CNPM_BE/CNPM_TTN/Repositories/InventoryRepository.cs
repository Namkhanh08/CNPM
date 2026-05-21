using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CNPM_TTN.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly ApplicationDbContext _context;

        public InventoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

     
        public async Task<IEnumerable<RawMaterial>> GetAllRawMaterialsAsync()
        {
            return await _context.RawMaterials.Include(r => r.Category).ToListAsync();
        }

        public async Task<IEnumerable<object>> GetInventoryReceiptsAsync()
        {
            return await _context.InventoryReceipts
                .Include(i => i.RawMaterial)
                .Include(i => i.User)
                .OrderByDescending(i => i.ImportDate)
                .Select(receipt => new
                {
                    receipt.Id,
                    RawMaterialName = receipt.RawMaterial.Name,
                    receipt.Supplier,
                    receipt.Quantity,
                    receipt.RemainingQuantity,
                    receipt.ImportDate,
                    receipt.ExpiryDate,
                    ManagerName = receipt.User != null ? receipt.User.Name : "Hệ thống",
                    IsExpired = receipt.ExpiryDate < DateTime.Now,
                    IsNearExpired = (receipt.ExpiryDate - DateTime.Now).TotalDays <= 30 && receipt.ExpiryDate > DateTime.Now
                })
                .ToListAsync();
        }

        public async Task<bool> ImportRawMaterialAsync(int rawMaterialId, string supplier, double quantity, DateTime importDate, DateTime expiryDate, string userId)
        {
            if (quantity <= 0 || expiryDate < importDate) return false;

            //Tạo bản ghi lô nhập kho mới 
            var receipt = new InventoryReceipt
            {
                RawMaterialId = rawMaterialId,
                Supplier = supplier,
                Quantity = quantity,
                RemainingQuantity = quantity, 
                ImportDate = importDate,
                ExpiryDate = expiryDate,
                CreatedBy = userId
            };
            _context.InventoryReceipts.Add(receipt);
            double oldTotalQty = await _context.InventoryReceipts
                .Where(r => r.RawMaterialId == rawMaterialId)
                .SumAsync(r => r.RemainingQuantity);
            double newTotalQty = oldTotalQty + quantity;         
            var log = new RawMaterialLog
            {
                RawMaterialId = rawMaterialId,                                                                                                                                                                     
                RawMaterial = null,
                Action = "NHAP_KHO_NGUYEN_LIEU",    
                OldQuantity = oldTotalQty,             
                NewQuantity = newTotalQty,           
                Reason = $"Nhập mới lô hàng {quantity} kg từ nhà cung cấp: {supplier}",
                ModifiedBy = userId,
                ModifiedDate = DateTime.Now
            };
            _context.RawMaterialLogs.Add(log);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Product>> GetAllProductAsync()
        {
            return await _context.Products.ToListAsync();
        }

        public async Task<IEnumerable<object>> GetRawMaterialLogsAsync()
        {
            return await _context.RawMaterialLogs
                .Include(l => l.RawMaterial)
                .OrderByDescending(l => l.ModifiedDate)
                .Select(l => new
                {
                    id = l.Id,
                    rawMaterialId = l.RawMaterialId,
                    rawMaterialName = l.RawMaterial.Name, 
                    action = l.Action,
                    oldQuantity = l.OldQuantity,
                    newQuantity = l.NewQuantity,
                    reason = l.Reason,
                    modifiedBy = l.ModifiedBy,
                    modifiedDate = l.ModifiedDate
                })
                .ToListAsync();
        }
        public async Task<IEnumerable<object>> GetRoastingBatchesAsync()
        {
            return await _context.RoastingBatches
                .Include(b => b.User)
                .Include(b => b.Product)
                .Include(b => b.InventoryReceipt).ThenInclude(ir => ir.RawMaterial)
                .OrderByDescending(x => x.RoastDate)
                .Select(batch => new
                {
                    batch.Id,
                    batch.BatchCode,
                    ProductName = batch.Product.Name,
                    RawMaterialName = batch.InventoryReceipt != null ? batch.InventoryReceipt.RawMaterial.Name : "N/A",
                    batch.RoastLevel,
                    Weight = batch.InputWeight,
                    RoasterName = batch.User != null ? batch.User.Name : "N/A",
                    batch.Status,
                    Date = batch.RoastDate
                })
                .ToListAsync();
        }

        public async Task<bool> CreateRoastingBatchAsync(int productId, int inventoryReceiptId, string batchCode, string roastLevel, double inputWeight, string status, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = await _context.Products.FindAsync(productId);
                var receipt = await _context.InventoryReceipts.FindAsync(inventoryReceiptId);

                if (product == null || receipt == null) return false;
                if (receipt.RemainingQuantity < inputWeight) return false;

                double oldRawMaterialQty = receipt.RemainingQuantity;

                receipt.RemainingQuantity -= inputWeight;

                if (status == "Đã đóng gói")
                {
                    product.Stock += (int)inputWeight;
                }

                var newBatch = new RoastingBatch
                {
                    ProductId = productId,
                    InventoryReceiptId = inventoryReceiptId,
                    BatchCode = batchCode,
                    RoastLevel = roastLevel,
                    InputWeight = inputWeight,
                    Status = status,
                    UserId = userId,
                    RoastDate = DateTime.Now
                };

                var log = new RawMaterialLog
                {
                    RawMaterialId = receipt.RawMaterialId,
                    ReceiptId = inventoryReceiptId,
                    Action = "XUAT_RANG_CA_PHE",
                    OldQuantity = oldRawMaterialQty,
                    NewQuantity = receipt.RemainingQuantity,
                    Reason = $"Xuất kho {inputWeight} kg để thực hiện mẻ rang mã {batchCode} (Trạng thái: {status})",
                    ModifiedBy = userId,
                    ModifiedDate = DateTime.Now
                };

                _context.RoastingBatches.Add(newBatch);
                _context.RawMaterialLogs.Add(log);

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

        public async Task<bool> UpdateBatchStatusAsync(int batchId, string newStatus, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var batch = await _context.RoastingBatches.FindAsync(batchId);
                if (batch == null) return false;

                if (batch.Status == "Đã đóng gói" && newStatus != "Đã đóng gói") return false;

                if (batch.Status == newStatus) return true;

                if (batch.Status != "Đã đóng gói" && newStatus == "Đã đóng gói")
                {
                    var product = await _context.Products.FindAsync(batch.ProductId);
                    if (product != null)
                    {
                        product.Stock += (int)batch.InputWeight;
                    }
                }

             
                batch.Status = newStatus;

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