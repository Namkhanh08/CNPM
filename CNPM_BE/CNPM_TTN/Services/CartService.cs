using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.EntityFrameworkCore;
namespace CNPM_TTN.Services
{
    public class CartService : ICartService
    {
        private readonly IRepository<Cart> _cartRepository;
        private readonly IRepository<CartItem> _cartItemRepository;
        private readonly IRepository<Product> _productRepository;

        public CartService(IRepository<Cart> cartRepository, IRepository<CartItem> cartItemRepository, IRepository<Product> productRepository)
        {
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _productRepository = productRepository;
        }
        // lay gio hang cua user
        public async Task<Cart> GetCartAsync(string userId)
        {
            var cart = await _cartRepository.Query()
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.GrindingOption)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                await _cartRepository.AddAsync(cart);
            }
            return cart;
        }
        // them vao gio hang 
        public async Task<Cart> AddToCartAsync(string userId, int productId, int quantity, int? grindingOptionId, string? flavorNotes)
        {
            var cart = await GetCartAsync(userId);
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null) throw new KeyNotFoundException("Sản phẩm không tồn tại.");
            // Kiểm tra xem sản phẩm có cấu hình trùng kiểu xay và hương vị trong giỏ chưa
            var existingItem = cart.CartItems.FirstOrDefault(ci =>
                ci.ProductId == productId &&
                ci.GrindingOptionId == grindingOptionId &&
                ci.FlavorNotes == flavorNotes);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                await _cartItemRepository.UpdateAsync(existingItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = productId,
                    Quantity = quantity,
                    GrindingOptionId = grindingOptionId,
                    FlavorNotes = flavorNotes
                };
                await _cartItemRepository.AddAsync(newItem);
            }
            return await GetCartAsync(userId);
        }
        // cap nhat so luong san pham trong gio hang
        public async Task<Cart> UpdateCartItemQuantityAsync(string userId, int cartItemId, int quantity)
        {
            var cart = await GetCartAsync(userId);
            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);

            if (cartItem == null) throw new KeyNotFoundException("Không tìm thấy sản phẩm trong giỏ.");
            if (quantity <= 0)
            {
                await _cartItemRepository.DeleteAsync(cartItem);
            }
            else
            {
                cartItem.Quantity = quantity;
                await _cartItemRepository.UpdateAsync(cartItem);
            }
            return await GetCartAsync(userId);
        }
        // xoa san pham khoi gio hang
        // Xóa sản phẩm khỏi giỏ hàng
        public async Task<Cart> RemoveFromCartAsync(string userId, int cartItemId)
        {
            var cart = await GetCartAsync(userId);
            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
            if (cartItem != null)
            {
                await _cartItemRepository.DeleteAsync(cartItem);
            }
            return await GetCartAsync(userId);
        }




    }
}
