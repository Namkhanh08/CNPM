using CNPM_TTN.Data;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetAllProductsAsync(ProductFilterRequest filter)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductDetails)
                .AsQueryable();

            // tên sản phẩm
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(x =>
                    x.Name.Contains(filter.Search));
            }

            // nhiều category
            if (filter.CategoryIds.Any())
            {
                query = query.Where(x =>
                    filter.CategoryIds.Contains(x.CategoryId));
            }

            // giá
            if (filter.MinPrice.HasValue)
            {
                query = query.Where(x =>
                    x.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(x =>
                    x.Price <= filter.MaxPrice.Value);
            }

            // trạng thái
            switch (filter.Status)
            {
                case "instock":
                    query = query.Where(x => x.Stock > 20);
                    break;

                case "lowstock":
                    query = query.Where(x => x.Stock > 0 && x.Stock <= 20);
                    break;

                case "outstock":
                    query = query.Where(x => x.Stock == 0);
                    break;
            }

            return await query.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                price = p.Price,
                stock = p.Stock,
                imageUrl = p.ImageUrl,
                description = p.Description,
                categoryId = p.CategoryId,

                type = p.Category.Name,

                details = p.ProductDetails.Select(d => new
                {
                    d.Region,
                    d.Process,
                    d.Roast,
                    d.FlavorNotes,
                    d.AcidityLevel,
                    d.BitternessLevel,
                    d.BodyLevel
                }).FirstOrDefault()
            }).ToListAsync();
        }


        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<bool> AddProductAsync(ProductRequest request)
        {
            var product = new Product
            {
                Name = request.Name,
                Price = request.Price,
                Stock = request.Stock,
                ImageUrl = request.ImageUrl ?? "",
                Description = request.Description ?? "",
                CategoryId = request.CategoryId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            if (request.ProductDetail != null) 
            {
                var detail = new ProductDetail
                {
                    ProductId = product.Id, 
                    Region = request.ProductDetail.Region,
                    Process = request.ProductDetail.Process,
                    Roast = request.ProductDetail.Roast,
                    FlavorNotes = request.ProductDetail.FlavorNotes,
                    AcidityLevel = request.ProductDetail.AcidityLevel,
                    BitternessLevel = request.ProductDetail.BitternessLevel,
                    BodyLevel = request.ProductDetail.BodyLevel,
                    BestTime = request.ProductDetail.BestTime,
                    MatchTags = request.ProductDetail.MatchTags
                };
                _context.ProductDetails.Add(detail);
            }

            return await _context.SaveChangesAsync() > 0;
        }

 
        public async Task<bool> UpdateProductAsync(ProductRequest request)
        {
            var existingProduct = await _context.Products
                .Include(p => p.ProductDetails)
                .FirstOrDefaultAsync(p => p.Id == request.Id);

            if (existingProduct == null) return false;
            existingProduct.Name = request.Name;
            existingProduct.Price = request.Price;
            existingProduct.Stock = request.Stock;
            existingProduct.ImageUrl = request.ImageUrl;
            existingProduct.Description = request.Description;
            existingProduct.CategoryId = request.CategoryId;
            if (request.ProductDetail != null)
            {
                var existingDetail = existingProduct.ProductDetails.FirstOrDefault();

                if (existingDetail != null)
                {
                    existingDetail.Region = request.ProductDetail.Region;
                    existingDetail.Process = request.ProductDetail.Process;
                    existingDetail.Roast = request.ProductDetail.Roast;
                    existingDetail.FlavorNotes = request.ProductDetail.FlavorNotes;
                    existingDetail.AcidityLevel = request.ProductDetail.AcidityLevel;
                    existingDetail.BitternessLevel = request.ProductDetail.BitternessLevel;
                    existingDetail.BodyLevel = request.ProductDetail.BodyLevel;
                    existingDetail.BestTime = request.ProductDetail.BestTime;
                    existingDetail.MatchTags = request.ProductDetail.MatchTags;
                }
                else
                {
                    var newDetail = new ProductDetail
                    {
                        ProductId = existingProduct.Id,
                        Region = request.ProductDetail.Region,
                        Process = request.ProductDetail.Process,
                        Roast = request.ProductDetail.Roast,
                        FlavorNotes = request.ProductDetail.FlavorNotes,
                        AcidityLevel = request.ProductDetail.AcidityLevel,
                        BitternessLevel = request.ProductDetail.BitternessLevel,
                        BodyLevel = request.ProductDetail.BodyLevel,
                    };
                    _context.ProductDetails.Add(newDetail);
                }
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductDetails) 
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return false;

            _context.Products.Remove(product);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<ProductUserResponse>> GetAllProductsForUserAsync(int? categoryId = null)
        {
            
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductDetails)
                .Include(p => p.ProductGrindingOptions)
                    .ThenInclude(pg => pg.GrindingOption) 
                .AsQueryable();

            
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            return await query.Select(p => new ProductUserResponse
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CategoryId = p.CategoryId,
                Type = p.Category != null ? p.Category.Name : "N/A",

                Details = p.ProductDetails.Select(d => new ProductDetailUserResponse
                {
                    Region = d.Region,
                    Process = d.Process,
                    Roast = d.Roast,
                    FlavorNotes = d.FlavorNotes,
                    Weight = d.Weight,
                    Height = d.Height,
                    AcidityLevel = d.AcidityLevel,
                    BitternessLevel = d.BitternessLevel,
                    BodyLevel = d.BodyLevel,


                    GrindingOptions = p.ProductGrindingOptions
                        .Where(pg => pg.GrindingOption != null)
                        .Select(pg => new GrindingOptionResponse
                        {
                            Id = pg.GrindingOptionId,
                            Name = pg.GrindingOption.Name 
                        }).ToList()
                }).FirstOrDefault()
            }).ToListAsync();
        }

        public async Task<ProductUserResponse?> GetProductDetailForUserAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductDetails)
                
                .Include(p => p.ProductGrindingOptions)
                    
                    .ThenInclude(pg => pg.GrindingOption)
                .Where(p => p.Id == id)
                .Select(p => new ProductUserResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Stock = p.Stock,
                    ImageUrl = p.ImageUrl,
                    Description = p.Description,
                    CategoryId = p.CategoryId,
                    Type = p.Category != null ? p.Category.Name : "N/A",

                    Details = p.ProductDetails.Select(d => new ProductDetailUserResponse
                    {
                        Region = d.Region,
                        Process = d.Process,
                        Roast = d.Roast,
                        FlavorNotes = d.FlavorNotes,
                        Weight = d.Weight,
                        Height = d.Height,
                        AcidityLevel = d.AcidityLevel,
                        BitternessLevel = d.BitternessLevel,
                        BodyLevel = d.BodyLevel,

                       
                        GrindingOptions = p.ProductGrindingOptions
                            .Where(pg => pg.GrindingOption != null)
                            .Select(pg => new GrindingOptionResponse
                            {
                                Id = pg.GrindingOptionId,
                                Name = pg.GrindingOption.Name 
                            }).ToList()
                    }).FirstOrDefault()
                }).FirstOrDefaultAsync();
        }
        public decimal GetProductPrice(long productId)
        {
            return _context.Products
                .Where(p => p.Id == productId)
                .Select(p => p.Price)
                .FirstOrDefault();
        }
        public ProductDetail? FindProductById(int id)
        {
            return _context.ProductDetails
                .Include(pd => pd.Product)
                .Include(pd => pd.GrindingOptions)
                .AsNoTracking()
                .FirstOrDefault(pd => pd.ProductId == id);
        }

        public Product? GetById(int productId)
        {
            return _context.Products.Find(productId);
        }

        public void Update(Product product)
        {
            var existingProduct = _context.Products.Find(product.Id);
            if (existingProduct != null)
            {
                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.Stock = product.Stock;
                existingProduct.ImageUrl = product.ImageUrl;
                existingProduct.CategoryId = product.CategoryId;

                _context.SaveChanges(); // Lưu thay đổi vào SQL Server
            }
        }


    }
}