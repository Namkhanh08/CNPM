using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using CNPM_TTN.Dtos;
using System.Linq.Expressions;
namespace CNPM_TTN.Services
{
    public class ProductService : IProductService
    {
        private readonly IRepository<Product> _productRepository;
        public ProductService(IRepository<Product> productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<(IEnumerable<ProductDto> Items, int TotalCount)> GetProductsAsync(string? searchTerm, int page, int pageSize)
        {
            Expression<Func<Product, bool>>? filter = null;
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                filter = p => p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm);
            }

            var pagedResult = await _productRepository.GetPagedAsync(page, pageSize, filter);

            var items = pagedResult.Items.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CategoryId = p.CategoryId
            }).ToList();

            return (items, pagedResult.TotalCount);
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
