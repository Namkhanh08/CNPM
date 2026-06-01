using CNPM_TTN.Data;
using CNPM_TTN.Dtos;
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

        public async Task<PagedResultDto<object>> GetInventoryReceiptsAsync(
            int page,
            int pageSize,
            string? search,
            string? status)
        {
            var query = _context.InventoryReceipts
                .Include(i => i.RawMaterial)
                .Include(i => i.User)
                .AsQueryable();

            // SEARCH
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();

                query = query.Where(x =>
                    x.RawMaterial.Name.ToLower().Contains(search) ||
                    x.Supplier.ToLower().Contains(search));
            }

            // FILTER
            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                var today = DateTime.Now;

                query = status switch
                {
                    "empty" => query.Where(x => x.RemainingQuantity == 0),

                    "expired" => query.Where(x => x.ExpiryDate <= today),

                    "warning" => query.Where(x =>
                        x.ExpiryDate > today &&
                        EF.Functions.DateDiffDay(today, x.ExpiryDate) <= 7),

                    "safe" => query.Where(x =>
                        x.RemainingQuantity > 0 &&
                        x.ExpiryDate > today &&
                        EF.Functions.DateDiffDay(today, x.ExpiryDate) > 7),

                    _ => query
                };
            }

            var totalItems = await query.CountAsync();

            var data = await query
                .OrderByDescending(i => i.ImportDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
               .Select(receipt => new
               {
                   receipt.Id,
                   receipt.RawMaterialId,

                   RawMaterialName = receipt.RawMaterial.Name,

                   receipt.Supplier,

                   receipt.Quantity,
                   receipt.RemainingQuantity,

                   receipt.ImportDate,
                   receipt.ExpiryDate,

                   IsExpired = receipt.ExpiryDate <= DateTime.Now,

                   ManagerName = receipt.User != null
                   ? receipt.User.Name
                   : "Hệ thống"
                        })
                .ToListAsync();

            return new PagedResultDto<object>
            {
                Data = data,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
            };
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

        public async Task<PagedResultDto<object>> GetRawMaterialLogsAsync(int page,int pageSize,string? search,string? action)
        {
            var query = _context.RawMaterialLogs
                .Include(l => l.RawMaterial)
                .Include(l => l.User)
                .AsQueryable();

            // SEARCH
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();

                query = query.Where(x =>
                    x.RawMaterial.Name.ToLower().Contains(search) ||
                    x.Action.ToLower().Contains(search) ||
                    x.Reason.ToLower().Contains(search));
            }

            // FILTER ACTION
            if (!string.IsNullOrEmpty(action) && action != "all")
            {
                query = query.Where(x => x.Action.Contains(action));
            }

            var totalItems = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.ModifiedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
                    modifiedByName = l.User != null ? l.User.Name : "Hệ thống",
                    modifiedDate = l.ModifiedDate
                })
                .ToListAsync();

            return new PagedResultDto<object>
            {
                Data = data,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
            };
        }


        public async Task<PagedResultDto<object>> GetRoastingBatchesAsync(int page,int pageSize,string? search,string? status)
        {
            var query = _context.RoastingBatches
                .Include(b => b.User)
                .Include(b => b.Product)
                .Include(b => b.InventoryReceipt)
                    .ThenInclude(ir => ir.RawMaterial)
                .AsQueryable();

            // SEARCH
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();

                query = query.Where(x =>
                    x.BatchCode.ToLower().Contains(search) ||
                    x.Product.Name.ToLower().Contains(search) ||
                    x.InventoryReceipt.RawMaterial.Name.ToLower().Contains(search));
            }

            // FILTER STATUS
            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                query = query.Where(x => x.Status == status);
            }

            var totalItems = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.RoastDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(batch => new
                {
                    batch.Id,
                    batch.BatchCode,

                    ProductName = batch.Product.Name,

                    RawMaterialName = batch.InventoryReceipt != null
                        ? batch.InventoryReceipt.RawMaterial.Name
                        : "N/A",

                    batch.RoastLevel,

                    Supplier = batch.InventoryReceipt != null
                        ? batch.InventoryReceipt.Supplier
                        : "N/A",

                    InputWeight = batch.InputWeight,

                    OutputWeight = batch.OutputWeight ?? 0,

                    RecoveryRate =
                        batch.OutputWeight.HasValue && batch.InputWeight > 0
                            ? Math.Round(
                                ((double)batch.OutputWeight.Value /
                                (double)batch.InputWeight) * 100, 1)
                            : 0,

                    RoasterName = batch.User != null
                        ? batch.User.Name
                        : "N/A",

                    batch.Status,

                    Date = batch.RoastDate
                })
                .ToListAsync();

            return new PagedResultDto<object>
            {
                Data = data,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
            };
        }
        public async Task<InventoryResult> CreateRoastingBatchAsync(int productId, int inventoryReceiptId, string batchCode, string roastLevel, double inputWeight, string status, double? outputWeight, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = await _context.Products.FindAsync(productId);
                var receipt = await _context.InventoryReceipts.FindAsync(inventoryReceiptId);

                if (product == null || receipt == null)
                    return new InventoryResult { Success = false, Message = "Sản phẩm hoặc lô nguyên liệu không tồn tại." };

                if (receipt.RemainingQuantity < inputWeight)
                    return new InventoryResult { Success = false, Message = "Tạo mẻ rang thất bại. Lô nguyên liệu không đủ số lượng tồn kho!" };

                
                if ((status == "Đã đóng gói" || status == "Hoàn thành") && outputWeight.HasValue)
                {
                    if (outputWeight.Value > inputWeight)
                    {
                        return new InventoryResult  
                        {
                            Success = false,
                            Message = $"Khối lượng thành phẩm đầu ra ({outputWeight.Value} kg) không được lớn hơn khối lượng thô đầu vào ({inputWeight} kg)!"
                        };
                    }
                }

                double oldRawMaterialQty = receipt.RemainingQuantity;
                receipt.RemainingQuantity -= inputWeight;

            
                if (status == "Đã đóng gói")
                {
                    double finalWeight = outputWeight.HasValue ? outputWeight.Value : inputWeight;
                    product.Stock += (int)finalWeight;
                }

                var newBatch = new RoastingBatch
                {
                    ProductId = productId,
                    InventoryReceiptId = inventoryReceiptId,
                    BatchCode = batchCode,
                    RoastLevel = roastLevel,
                    InputWeight = inputWeight,
                    OutputWeight = outputWeight, 
                    Status = status,
                    UserId = userId,
                    RoastDate = DateTime.Now,
                    
                };

                var log = new RawMaterialLog
                {
                    RawMaterialId = receipt.RawMaterialId,
                    ReceiptId = inventoryReceiptId,
                    Action = "XUAT_RANG_CA_PHE",
                    OldQuantity = oldRawMaterialQty,
                    NewQuantity = receipt.RemainingQuantity,
                    Reason = $"Xuất kho {inputWeight} kg ở lô nhập {receipt.Id} " +
                     $"từ nhà cung cấp: {receipt.Supplier} " +
                     $"để thực hiện mẻ rang mã {batchCode} " +
                     $"(Trạng thái: {status})",

                    ModifiedBy = userId,
                    ModifiedDate = DateTime.Now
                };

                _context.RoastingBatches.Add(newBatch);
                _context.RawMaterialLogs.Add(log);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return new InventoryResult { Success = true, Message = "Tạo mẻ rang mới thành công!" };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new InventoryResult { Success = false, Message = "Lỗi hệ thống: " + ex.Message };
            }
        }

        public async Task<InventoryResult> UpdateBatchStatusAsync(int batchId, string newStatus, double? outputWeight, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var batch = await _context.RoastingBatches.FindAsync(batchId);
                if (batch == null)
                    return new InventoryResult { Success = false, Message = "Không tìm thấy thông tin mẻ rang." };

                if (batch.Status == "Đã đóng gói" && newStatus != "Đã đóng gói")
                    return new InventoryResult { Success = false, Message = "Mẻ rang đã đóng gói, không thể thay đổi ngược lại trạng thái." };

                if (batch.Status == newStatus)
                    return new InventoryResult { Success = true, Message = "Trạng thái không thay đổi." };

             
                if (outputWeight.HasValue && outputWeight.Value > batch.InputWeight)
                {
                    return new InventoryResult
                    {
                        Success = false,
                        Message = $"Khối lượng thành phẩm đầu ra ({outputWeight.Value} kg) không được phép lớn hơn khối lượng thô đầu vào ({batch.InputWeight} kg)!"
                    };
                }

           
                if (batch.Status != "Đã đóng gói" && newStatus == "Đã đóng gói")
                {
                    var product = await _context.Products.FindAsync(batch.ProductId);
                    if (product != null)
                    {
                        double finalWeight = outputWeight.HasValue ? outputWeight.Value : (double)batch.InputWeight;
                        product.Stock += (int)finalWeight;
                    }
                }

                batch.Status = newStatus;
                if (outputWeight.HasValue)
                {
                    batch.OutputWeight = outputWeight.Value; 
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return new InventoryResult { Success = true, Message = "Cập nhật trạng thái mẻ rang thành công!" };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new InventoryResult { Success = false, Message = "Lỗi hệ thống: " + ex.Message };
            }
        }

        public async Task<bool> CreateRawMaterialAsync(string name, string unit, int categoryId)
        {
         
            var exists = await _context.RawMaterials
                .AnyAsync(x => x.Name.ToLower() == name.ToLower());

            if (exists) return false;

            var rawMaterial = new RawMaterial
            {
                Name = name,
                Unit = string.IsNullOrEmpty(unit) ? "kg" : unit,
                CategoryId = categoryId,
                CreatedDate = DateTime.Now
            };

            _context.RawMaterials.Add(rawMaterial);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<object>> GetAvailableReceiptsAsync()
        {
            return await _context.InventoryReceipts
                .Include(r => r.RawMaterial)

              
                .Where(r => r.RemainingQuantity > 0)

           
                .Where(r => r.ExpiryDate > DateTime.Now)

               
                .OrderBy(r => r.ExpiryDate)

                .Select(r => new
                {
                    r.Id,

                    r.RawMaterialId,

                    RawMaterialName = r.RawMaterial.Name,

                    r.Supplier,

                    r.Quantity,

                    r.RemainingQuantity,

                    r.ImportDate,

                    r.ExpiryDate,

                    IsExpired = false
                })

                .ToListAsync();
        }
        public async Task<double> GetTotalQuantityAsync()
        {
            return await _context.Products.SumAsync(p => p.Stock);
        }
    }
}