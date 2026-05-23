using System;
using System.Collections.Generic;
using System.Linq;
using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Repositories
{
    public class ProductRepository
    {
        private readonly ApplicationDbContext _context;

        // Tiêm trực tiếp ApplicationDbContext vào Repository thay vì ConnectionString
        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Product> FindAllManual()
        {
            return _context.Products.AsNoTracking().ToList();
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

        // 5. Lấy giá sản phẩm dưới dạng decimal
        public decimal GetProductPrice(long productId)
        {
            return _context.Products
                .Where(p => p.Id == productId)
                .Select(p => p.Price)
                .FirstOrDefault();
        }
    }
}