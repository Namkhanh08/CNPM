using System;
using System.Collections.Generic;
using System.Linq;
using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Repositories
{
    public class CartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy thông tin giỏ hàng theo UserId
        public Cart? FindByUserId(string userId)
        {
            return _context.Carts.FirstOrDefault(C => C.UserId == userId);
        }

        //Lấy danh sách Item kèm thông tin Product liên kết
        public List<CartItem> GetCartItemsByUser(string userId)
        {
            var cart = _context.Carts.FirstOrDefault(c => c.UserId == userId);

            if (cart == null)
            {
                return new List<CartItem>();
            }

            return _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.CartId == cart.Id)
                .ToList();
        }

        //Tạo mới giỏ hàng trống cho User
        public void CreateCart(string userId)
        {
            var cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            _context.SaveChanges();
        }

        //Tìm kiếm chính xác các Item dựa trên tổ hợp các thuộc tính
        public CartItem? FindByCartAndProduct(int cartId, int productId, int grindingOptionId, string? flavorNotes, string? weight)
        {
            string? normalizedFlavorNotes = string.IsNullOrWhiteSpace(flavorNotes) ? null : flavorNotes.Trim();
            string? normalizedWeight = string.IsNullOrWhiteSpace(weight) ? null : weight.Trim();

            return _context.CartItems.FirstOrDefault(ci =>
                ci.CartId == cartId &&
                ci.ProductId == productId &&
                ci.GrindingOptionId == grindingOptionId &&
                ci.FlavorNotes == normalizedFlavorNotes &&
                ci.Weight == normalizedWeight
            );
        }


        // Thêm mới một dòng sản phẩm vào giỏ
        public void AddItem(CartItem item)
        {
            _context.CartItems.Add(item);
            _context.SaveChanges();
        }

        // Cập nhật số lượng của một Item cụ thể dựa trên thông tin so khớp
        public void UpdateQuantity(string userId, int productId, int newQuantity, int grindingOptionId, string? flavorNotes, string? weight)
        {
            string? normalizedFlavorNotes = string.IsNullOrWhiteSpace(flavorNotes) ? null : flavorNotes.Trim();

            var item = _context.CartItems.FirstOrDefault(ci =>
                ci.ProductId == productId &&
                ci.GrindingOptionId == grindingOptionId &&
                ci.FlavorNotes == normalizedFlavorNotes &&
                ci.Weight == weight &&
                _context.Carts.Any(c => c.Id == ci.CartId && c.UserId == userId)
            );

            if (item != null)
            {
                item.Quantity = newQuantity;
                _context.SaveChanges();
            }
        }

        // Xóa hoàn toàn sản phẩm ra khỏi giỏ dựa trên thông tin cấu hình
        public void DeleteItem(int productId, int grindingOptionId, string? flavorNotes, string? weight)
        {
            string? normalizedFlavorNotes = string.IsNullOrWhiteSpace(flavorNotes) ? null : flavorNotes.Trim();

            var itemsToDelete = _context.CartItems.Where(ci =>
                ci.ProductId == productId &&
                ci.GrindingOptionId == grindingOptionId &&
                ci.FlavorNotes == normalizedFlavorNotes &&
                ci.Weight == weight
            );

            if (itemsToDelete.Any())
            {
                _context.CartItems.RemoveRange(itemsToDelete);
                _context.SaveChanges();
            }
        }
    }
}