using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
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
            var roast = filterDto.Roast?.Trim();
            var minPrice = filterDto.MinPrice;
            var maxPrice = filterDto.MaxPrice;
            var region = filterDto.Region?.Trim();

            var query = _productRepository.Query()
                .Include(p => p.ProductDetails)
                .Include(p => p.OrderDetails)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(p => p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrEmpty(roast))
            {
                query = query.Where(p => p.ProductDetails.Any(d => d.Roast != null && d.Roast.ToLower().Contains(roast.ToLower())));
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
                else if (sort == "newest")
                    query = query.OrderByDescending(p => p.Id);
                else if (sort == "sold" || sort == "popular")
                    query = query
                        .OrderByDescending(p => p.OrderDetails.Sum(d => d.Quantity))
                        .ThenByDescending(p => p.Id);
                else
                    query = filterDto.Descending ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id);
            }
            else
            {
                query = query
                    .OrderByDescending(p => p.OrderDetails.Sum(d => d.Quantity))
                    .ThenByDescending(p => p.Id);
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
                Region = p.ProductDetails?.FirstOrDefault()?.Region,
                SoldCount = p.OrderDetails?.Sum(d => d.Quantity) ?? 0
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
            var product = await _productRepository.Query()
                .Include(p => p.ProductDetails)
                    .ThenInclude(pd => pd.FarmingZone)
                .Include(p => p.GrindingOptions)
                .Include(p => p.ProductVariants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return null;

            var detail = product.ProductDetails.FirstOrDefault();
            var variantWeights = product.ProductVariants
                .Where(v => v.IsActive && !string.IsNullOrWhiteSpace(v.Weight))
                .Select(v => v.Weight)
                .Distinct()
                .ToList();
            var weightOptions = !string.IsNullOrWhiteSpace(detail?.WeightOptions)
                ? detail.WeightOptions
                : string.Join(",", variantWeights);
            var legacyTraceData = ParseTraceabilityData(detail?.TraceabilityData);

            return new ProductDetailDto
            {
                Id = product.Id,
                Product = new ProductDto { Id = product.Id, Name = product.Name, Price = product.Price, Stock = product.Stock, ImageUrl = product.ImageUrl, Description = product.Description, CategoryId = product.CategoryId },
                Region = detail?.Region ?? FormatRegion(detail?.FarmingZone) ?? legacyTraceData?.FarmingZone?.Name,
                Process = detail?.Process,
                Roast = detail?.Roast,
                FlavorNotes = detail?.FlavorNotes,
                AcidityLevel = detail?.AcidityLevel,
                BitternessLevel = detail?.BitternessLevel,
                BodyLevel = detail?.BodyLevel,
                BestTime = detail?.BestTime,
                MatchTags = detail?.MatchTags,
                WeightOptions = weightOptions,
                Altitude = detail?.FarmingZone?.Altitude ?? legacyTraceData?.FarmingZone?.Altitude,
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
            detail.WeightOptions = dto.WeightOptions;
            detail.TraceabilityData = dto.TraceabilityData;
        }

        private static string? FormatRegion(FarmingZone? farmingZone)
        {
            if (farmingZone == null) return null;

            return string.IsNullOrWhiteSpace(farmingZone.Province)
                ? farmingZone.Name
                : $"{farmingZone.Name}, {farmingZone.Province}";
        }

        private static TraceabilityDataDto? ParseTraceabilityData(string? jsonTraceData)
        {
            if (string.IsNullOrWhiteSpace(jsonTraceData)) return null;

            try
            {
                return JsonSerializer.Deserialize<TraceabilityDataDto>(jsonTraceData, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException)
            {
                return null;
            }
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
            var product = await BuildTraceabilityQuery()
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null) return null;

            var productDetail = product.ProductDetails.FirstOrDefault();
            var latestBatch = product.RoastingBatches
                .Where(IsCompletedRoastingBatch)
                .OrderByDescending(rb => rb.RoastDate)
                .FirstOrDefault()
                ?? product.RoastingBatches
                    .OrderByDescending(rb => rb.RoastDate)
                    .FirstOrDefault();

            var result = CreateBaseTraceabilityResult(product, productDetail);

            if (latestBatch != null)
            {
                ApplyRoastingBatchInfo(result, latestBatch);

                if (!ApplyHarvestBatchTraceability(result, latestBatch.InventoryReceipt?.HarvestBatch)
                    && !string.IsNullOrEmpty(latestBatch.TraceabilityData))
                {
                    result.DataSource = "RoastBatch";
                    ApplyJsonTraceability(result, latestBatch.TraceabilityData);
                }
            }

            ApplyProductFallbackTraceability(result, productDetail);

            if (latestBatch == null || result.FarmingZone == null)
            {
                result.WarningMessage = "Sản phẩm này hiện chưa cập nhật đầy đủ thông tin truy xuất nguồn gốc chi tiết. Vui lòng quay lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng để biết thêm chi tiết.";
            }

            return result;
        }

        public async Task<TraceabilityResultDto?> GetBatchTraceabilityAsync(string batchCode)
        {
            var product = await BuildTraceabilityQuery()
                .FirstOrDefaultAsync(p => p.RoastingBatches.Any(rb => rb.BatchCode == batchCode));

            if (product == null) return null;

            var productDetail = product.ProductDetails.FirstOrDefault();
            var batch = product.RoastingBatches.FirstOrDefault(rb => rb.BatchCode == batchCode);

            if (batch == null) return null;

            var result = CreateBaseTraceabilityResult(product, productDetail);
            ApplyRoastingBatchInfo(result, batch);
            result.DataSource = "RoastBatch";

            if (!ApplyHarvestBatchTraceability(result, batch.InventoryReceipt?.HarvestBatch)
                && !string.IsNullOrEmpty(batch.TraceabilityData))
            {
                ApplyJsonTraceability(result, batch.TraceabilityData);
            }

            ApplyProductFallbackTraceability(result, productDetail);

            return result;
        }

        private IQueryable<Product> BuildTraceabilityQuery()
        {
            return _productRepository.Query()
                .Include(p => p.ProductDetails)
                    .ThenInclude(pd => pd.FarmingZone)
                .Include(p => p.RoastingBatches)
                    .ThenInclude(rb => rb.InventoryReceipt)
                        .ThenInclude(ir => ir!.HarvestBatch)
                            .ThenInclude(hb => hb!.Farmer)
                                .ThenInclude(f => f.FarmingZone)
                .Include(p => p.RoastingBatches)
                    .ThenInclude(rb => rb.InventoryReceipt)
                        .ThenInclude(ir => ir!.HarvestBatch)
                            .ThenInclude(hb => hb!.Farmer)
                                .ThenInclude(f => f.FarmerCertifications)
                                    .ThenInclude(fc => fc.Certification)
                .Include(p => p.RoastingBatches)
                    .ThenInclude(rb => rb.User);
        }

        private static TraceabilityResultDto CreateBaseTraceabilityResult(Product product, ProductDetail? productDetail)
        {
            return new TraceabilityResultDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImage = product.ImageUrl,
                Process = productDetail?.Process,
                Region = productDetail?.Region
            };
        }

        private static bool IsCompletedRoastingBatch(RoastingBatch batch)
        {
            return batch.Status == "Đã đóng gói"
                || batch.Status == "Hoàn thành";
        }

        private static void ApplyRoastingBatchInfo(TraceabilityResultDto result, RoastingBatch batch)
        {
            result.BatchCode = batch.BatchCode;
            result.RoastDate = batch.RoastDate;
            result.RoastLevel = batch.RoastLevel;
            result.RoasterName = batch.User?.Name;

            if (batch.InventoryReceipt == null) return;

            result.HarvestBatchCode = batch.InventoryReceipt.HarvestBatch?.BatchCode
                ?? $"HB-{batch.InventoryReceipt.ImportDate:yyyy-MM}-{batch.InventoryReceipt.Id}";
            result.ImportDate = batch.InventoryReceipt.ImportDate;
            result.SupplierName = batch.InventoryReceipt.Supplier;
        }

        private static bool ApplyHarvestBatchTraceability(TraceabilityResultDto result, HarvestBatch? harvestBatch)
        {
            if (harvestBatch?.Farmer == null) return false;

            result.HarvestBatchCode = harvestBatch.BatchCode;
            result.Process ??= harvestBatch.ProcessingMethod;
            result.DataSource = "HarvestBatch";

            var farmer = harvestBatch.Farmer;
            result.Farmer = new FarmerDto
            {
                Name = farmer.Name,
                Scale = farmer.Scale,
                FarmingMethod = farmer.FarmingMethod,
                Story = farmer.Story
            };

            ApplyFarmingZoneTraceability(result, farmer.FarmingZone);

            result.Certifications = farmer.FarmerCertifications
                .Select(fc => new CertificationDto
                {
                    Name = fc.Certification.Name,
                    Issuer = fc.Certification.Issuer,
                    ExpiryDate = fc.ExpiryDate?.ToString("yyyy-MM-dd"),
                    Image = fc.Certification.LogoUrl ?? fc.DocumentUrl
                })
                .ToList();

            return true;
        }

        private static void ApplyProductFallbackTraceability(TraceabilityResultDto result, ProductDetail? productDetail)
        {
            if (result.FarmingZone != null) return;

            if (productDetail?.FarmingZone != null)
            {
                ApplyFarmingZoneTraceability(result, productDetail.FarmingZone);
                result.DataSource = "ProductFarmingZone";
                return;
            }

            if (!string.IsNullOrEmpty(productDetail?.TraceabilityData))
            {
                result.DataSource = "ProductDefault";
                ApplyJsonTraceability(result, productDetail.TraceabilityData);
            }
        }

        private static void ApplyFarmingZoneTraceability(TraceabilityResultDto result, FarmingZone farmingZone)
        {
            result.Region ??= string.IsNullOrWhiteSpace(farmingZone.Province)
                ? farmingZone.Name
                : $"{farmingZone.Name}, {farmingZone.Province}";

            result.FarmingZone = new FarmingZoneDto
            {
                Name = farmingZone.Name,
                Altitude = farmingZone.Altitude,
                Soil = farmingZone.SoilType,
                Climate = farmingZone.Climate,
                Description = farmingZone.Description,
                Image = farmingZone.ImageUrl
            };
        }

        private static void ApplyJsonTraceability(TraceabilityResultDto result, string jsonTraceData)
        {
            try
            {
                var traceData = JsonSerializer.Deserialize<TraceabilityDataDto>(jsonTraceData, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (traceData == null) return;

                result.FarmingZone = traceData.FarmingZone;
                result.Farmer = traceData.Farmer;
                result.Certifications = traceData.Certifications;
            }
            catch (JsonException)
            {
                // Keep traceability response available even if legacy JSON is malformed.
            }
        }
    }
}
