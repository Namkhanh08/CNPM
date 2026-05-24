using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using CNPM_TTN.Dtos;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CNPM_TTN.Services
{
    public class ProductService : IProductService
    {
        private readonly IRepository<Product> _productRepository;
        public ProductService(IRepository<Product> productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<(IEnumerable<ProductDto> Items, int TotalCount)> GetProductsAsync(ProductFilterDto filterDto)
        {
            var searchTerm = filterDto.SearchTerm?.Trim();
            var categoryId = filterDto.CategoryId;
            var minPrice = filterDto.MinPrice;
            var maxPrice = filterDto.MaxPrice;
            var region = filterDto.Region?.Trim();

            var query = _productRepository.Query().Include(p => p.ProductDetails).AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(p => p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(region))
            {
                query = query.Where(p => p.ProductDetails.Any(d => d.Region == region));
            }

            var totalCount = await query.CountAsync();

            if (!string.IsNullOrWhiteSpace(filterDto.SortBy))
            {
                var sort = filterDto.SortBy.ToLower();
                if (sort == "price")
                    query = filterDto.Descending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price);
                else if (sort == "name")
                    query = filterDto.Descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name);
                else if (sort == "stock")
                    query = filterDto.Descending ? query.OrderByDescending(p => p.Stock) : query.OrderBy(p => p.Stock);
                else
                    query = filterDto.Descending ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id);
            }
            else
            {
                query = filterDto.Descending ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id);
            }

            var pagedProducts = await query
                .Skip((filterDto.Page - 1) * filterDto.PageSize)
                .Take(filterDto.PageSize)
                .ToListAsync();

            var items = pagedProducts.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CategoryId = p.CategoryId,
                Region = p.ProductDetails?.FirstOrDefault()?.Region
            }).ToList();

            return (items, totalCount);
        }

        public async Task<IEnumerable<string>> GetRegionsAsync()
        {
            var regions = await _productRepository.Query()
                .SelectMany(p => p.ProductDetails)
                .Where(d => !string.IsNullOrEmpty(d.Region))
                .Select(d => d.Region!)
                .Distinct()
                .ToListAsync();
            return regions;
        }


        public async Task<ProductDetailDto?> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.FirstOrDefaultAsync(
                p => p.Id == id,
                p => p.ProductDetails,
                p => p.GrindingOptions);

            if (product == null) return null;

            var detail = product.ProductDetails.FirstOrDefault();

            return new ProductDetailDto
            {
                Id = product.Id,
                Product = new ProductDto { Id = product.Id, Name = product.Name, Price = product.Price, Stock = product.Stock, ImageUrl = product.ImageUrl, Description = product.Description, CategoryId = product.CategoryId },
                Region = detail?.Region,
                Process = detail?.Process,
                Roast = detail?.Roast,
                FlavorNotes = detail?.FlavorNotes,
                AcidityLevel = detail?.AcidityLevel,
                BitternessLevel = detail?.BitternessLevel,
                BodyLevel = detail?.BodyLevel,
                BestTime = detail?.BestTime,
                MatchTags = detail?.MatchTags,
                TraceabilityData = detail?.TraceabilityData,
                GrindingOption = product.GrindingOptions.Select(g => new GrindingOptionDto { Id = g.Id, Name = g.Name }).ToList()
            };
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                ImageUrl = dto.ImageUrl,
                Description = dto.Description,
                CategoryId = dto.CategoryId
            };

            if (dto.ProductDetail != null)
            {
                product.ProductDetails.Add(CreateProductDetail(dto.ProductDetail));
            }

            await _productRepository.AddAsync(product);

            return new ProductDto { Id = product.Id, Name = product.Name, Price = product.Price, Stock = product.Stock, ImageUrl = product.ImageUrl, Description = product.Description, CategoryId = product.CategoryId };
        }

        public async Task<bool> UpdateProductAsync(int id, UpdateProductDto dto)
        {
            var product = await _productRepository.Query()
                .Include(p => p.ProductDetails)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return false;

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.ImageUrl = dto.ImageUrl;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;

            if (dto.ProductDetail != null)
            {
                var detail = product.ProductDetails.FirstOrDefault();
                if (detail == null)
                {
                    product.ProductDetails.Add(CreateProductDetail(dto.ProductDetail));
                }
                else
                {
                    ApplyProductDetail(detail, dto.ProductDetail);
                }
            }

            await _productRepository.UpdateAsync(product);
            return true;
        }

        private static ProductDetail CreateProductDetail(ProductDetailInputDto dto)
        {
            var detail = new ProductDetail();
            ApplyProductDetail(detail, dto);
            return detail;
        }

        private static void ApplyProductDetail(ProductDetail detail, ProductDetailInputDto dto)
        {
            detail.Region = dto.Region;
            detail.Process = dto.Process;
            detail.Roast = dto.Roast;
            detail.FlavorNotes = dto.FlavorNotes;
            detail.AcidityLevel = dto.AcidityLevel;
            detail.BitternessLevel = dto.BitternessLevel;
            detail.BodyLevel = dto.BodyLevel;
            detail.BestTime = dto.BestTime;
            detail.MatchTags = dto.MatchTags;
            detail.TraceabilityData = dto.TraceabilityData;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return false;

            await _productRepository.DeleteAsync(product);
            return true;
        }

        public async Task<TraceabilityResultDto?> GetProductTraceabilityAsync(int productId)
        {
            var product = await _productRepository.Query()
                .Include(p => p.ProductDetails)
                .Include(p => p.RoastingBatches)
                    .ThenInclude(rb => rb.InventoryReceipt)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null) return null;

            var productDetail = product.ProductDetails.FirstOrDefault();
            
            // Lấy mẻ rang mới nhất đã hoàn thành / đóng gói
            var latestBatch = product.RoastingBatches
                .Where(rb => rb.Status == "Đã đóng gói" || rb.Status == "Hoàn thành")
                .OrderByDescending(rb => rb.RoastDate)
                .FirstOrDefault();

            var result = new TraceabilityResultDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImage = product.ImageUrl,
                Process = productDetail?.Process,
                Region = productDetail?.Region
            };

            string? jsonTraceData = null;

            if (latestBatch != null)
            {
                result.BatchCode = latestBatch.BatchCode;
                result.RoastDate = latestBatch.RoastDate;
                result.RoastLevel = latestBatch.RoastLevel;
                
                if (latestBatch.InventoryReceipt != null)
                {
                    result.HarvestBatchCode = $"HB-{latestBatch.InventoryReceipt.ImportDate:yyyy-MM}-{latestBatch.InventoryReceipt.Id}";
                    result.ImportDate = latestBatch.InventoryReceipt.ImportDate;
                    result.SupplierName = latestBatch.InventoryReceipt.Supplier;
                }

                if (!string.IsNullOrEmpty(latestBatch.TraceabilityData))
                {
                    jsonTraceData = latestBatch.TraceabilityData;
                    result.DataSource = "RoastBatch";
                }
            }

            if (string.IsNullOrEmpty(jsonTraceData) && productDetail != null && !string.IsNullOrEmpty(productDetail.TraceabilityData))
            {
                jsonTraceData = productDetail.TraceabilityData;
                result.DataSource = "ProductDefault";
            }

            if (!string.IsNullOrEmpty(jsonTraceData))
            {
                try
                {
                    var traceData = JsonSerializer.Deserialize<TraceabilityDataDto>(jsonTraceData, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (traceData != null)
                    {
                        result.FarmingZone = traceData.FarmingZone;
                        result.Farmer = traceData.Farmer;
                        result.Certifications = traceData.Certifications;
                    }
                }
                catch (JsonException)
                {
                    // Ignore parse error
                }
            }

            if (latestBatch == null)
            {
                result.WarningMessage = "Sản phẩm này hiện chưa cập nhật đầy đủ thông tin truy xuất nguồn gốc chi tiết. Vui lòng quay lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng để biết thêm chi tiết.";
            }

            return result;
        }

        public async Task<TraceabilityResultDto?> GetBatchTraceabilityAsync(string batchCode)
        {
            var product = await _productRepository.Query()
                .Include(p => p.ProductDetails)
                .Include(p => p.RoastingBatches)
                    .ThenInclude(rb => rb.InventoryReceipt)
                .FirstOrDefaultAsync(p => p.RoastingBatches.Any(rb => rb.BatchCode == batchCode));

            if (product == null) return null;

            var productDetail = product.ProductDetails.FirstOrDefault();
            var batch = product.RoastingBatches.FirstOrDefault(rb => rb.BatchCode == batchCode);

            if (batch == null) return null;

            var result = new TraceabilityResultDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImage = product.ImageUrl,
                Process = productDetail?.Process,
                Region = productDetail?.Region,
                BatchCode = batch.BatchCode,
                RoastDate = batch.RoastDate,
                RoastLevel = batch.RoastLevel,
                DataSource = "RoastBatch"
            };

            if (batch.InventoryReceipt != null)
            {
                result.HarvestBatchCode = $"HB-{batch.InventoryReceipt.ImportDate:yyyy-MM}-{batch.InventoryReceipt.Id}";
                result.ImportDate = batch.InventoryReceipt.ImportDate;
                result.SupplierName = batch.InventoryReceipt.Supplier;
            }

            string? jsonTraceData = batch.TraceabilityData;
            
            if (string.IsNullOrEmpty(jsonTraceData) && productDetail != null && !string.IsNullOrEmpty(productDetail.TraceabilityData))
            {
                jsonTraceData = productDetail.TraceabilityData;
                result.DataSource = "ProductDefault";
            }

            if (!string.IsNullOrEmpty(jsonTraceData))
            {
                try
                {
                    var traceData = JsonSerializer.Deserialize<TraceabilityDataDto>(jsonTraceData, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (traceData != null)
                    {
                        result.FarmingZone = traceData.FarmingZone;
                        result.Farmer = traceData.Farmer;
                        result.Certifications = traceData.Certifications;
                    }
                }
                catch (JsonException)
                {
                    // Ignore parse error
                }
            }

            return result;
        }
    }
}
