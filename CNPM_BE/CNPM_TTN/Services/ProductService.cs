using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using CNPM_TTN.Dtos;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
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

            await _productRepository.AddAsync(product);

            return new ProductDto { Id = product.Id, Name = product.Name, Price = product.Price, Stock = product.Stock, ImageUrl = product.ImageUrl, Description = product.Description, CategoryId = product.CategoryId };
        }

        public async Task<bool> UpdateProductAsync(int id, UpdateProductDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return false;

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.ImageUrl = dto.ImageUrl;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;

            await _productRepository.UpdateAsync(product);
            return true;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return false;

            await _productRepository.DeleteAsync(product);
            return true;
        }


    }
}
