using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly ShopCoffeeContext _context;

        public InventoryService(ShopCoffeeContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetProductsAsync()
        {
            return await _context.Products
                .OrderBy(p => p.Name)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Stock = p.Stock,
                    ImageUrl = p.ImageUrl,
                    Description = p.Description,
                    CategoryId = p.CategoryId
                })
                .ToListAsync();
        }

        public async Task<ApiResponse<string>> UpdateStockAsync(UpdateStockDto dto, string userId)
        {
            if (dto.Quantity == 0)
            {
                return ApiResponse<string>.FailureResponse("So luong cap nhat phai khac 0");
            }

            var user = await _context.Users.FindAsync(userId);
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
            {
                return ApiResponse<string>.FailureResponse("Khong tim thay san pham");
            }

            var newQuantity = product.Stock + dto.Quantity;
            if (newQuantity < 0)
            {
                return ApiResponse<string>.FailureResponse("Ton kho khong du de xuat");
            }

            var oldQuantity = product.Stock;
            product.Stock = newQuantity;

            _context.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                Action = dto.Quantity > 0 ? "NHAP_KHO" : "XUAT_KHO",
                OldQuantity = oldQuantity,
                NewQuantity = product.Stock,
                UserId = userId,
                ModifiedBy = user?.UserName ?? "He thong",
                ModifiedDate = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return ApiResponse<string>.SuccessResponse(null, "Cap nhat kho thanh cong");
        }

        public async Task<IEnumerable<InventoryLogDto>> GetInventoryLogsAsync()
        {
            return await _context.InventoryLogs
                .Include(log => log.Product)
                .Include(log => log.User)
                .OrderByDescending(log => log.ModifiedDate)
                .Take(20)
                .Select(log => new InventoryLogDto
                {
                    Id = log.Id,
                    ProductName = log.Product.Name,
                    Action = log.Action ?? string.Empty,
                    OldQuantity = log.OldQuantity,
                    NewQuantity = log.NewQuantity,
                    QuantityChange = log.NewQuantity - log.OldQuantity,
                    ModifiedBy = log.User != null ? log.User.Name : (log.ModifiedBy ?? "He thong"),
                    ModifiedDate = log.ModifiedDate
                })
                .ToListAsync();
        }

        public async Task<ApiResponse<string>> CreateRoastingBatchAsync(CreateRoastingBatchDto dto, string userId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = await _context.Users.FindAsync(userId);
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
            {
                return ApiResponse<string>.FailureResponse("Khong tim thay san pham");
            }

            if (product.Stock < dto.InputWeight)
            {
                return ApiResponse<string>.FailureResponse("Ton kho khong du de tao me rang");
            }

            var oldQuantity = product.Stock;
            product.Stock -= dto.InputWeight;

            _context.RoastingBatches.Add(new RoastingBatch
            {
                ProductId = product.Id,
                BatchCode = dto.BatchCode.Trim(),
                RoastLevel = dto.RoastLevel.Trim(),
                InputWeight = dto.InputWeight,
                Status = dto.Status.Trim(),
                UserId = userId,
                RoastDate = DateTime.Now
            });

            _context.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                Action = "RANG_CA_PHE",
                OldQuantity = oldQuantity,
                NewQuantity = product.Stock,
                UserId = userId,
                ModifiedBy = user?.UserName ?? "He thong",
                ModifiedDate = DateTime.Now
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<string>.SuccessResponse(null, "Tao me rang thanh cong");
        }

        public async Task<IEnumerable<RoastingBatchDto>> GetRoastingBatchesAsync()
        {
            return await _context.RoastingBatches
                .Include(batch => batch.Product)
                .Include(batch => batch.User)
                .OrderByDescending(batch => batch.RoastDate)
                .Select(batch => new RoastingBatchDto
                {
                    Id = batch.Id,
                    BatchCode = batch.BatchCode,
                    ProductName = batch.Product.Name,
                    RoastLevel = batch.RoastLevel ?? string.Empty,
                    Weight = batch.InputWeight ?? 0,
                    RoasterName = batch.User != null ? batch.User.Name : "N/A",
                    Status = batch.Status ?? string.Empty,
                    Date = batch.RoastDate
                })
                .ToListAsync();
        }

        public async Task<int> GetTotalStockAsync()
        {
            return await _context.Products.SumAsync(product => product.Stock);
        }
    }
}
