using System.Collections.Generic;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface ICartRepository
    {
        Cart? FindByUserId(string userId);
        List<CartItem> GetCartItemsByUser(string userId);
        void CreateCart(string userId);
        CartItem? FindByCartAndProduct(int cartId, int productId, int grindingOptionId, string? flavorNotes, string? weight);
        void AddItem(CartItem item);
        void UpdateQuantity(string userId, int productId, int newQuantity, int grindingOptionId, string? flavorNotes, string? weight);
        void DeleteItem(int productId, int grindingOptionId, string? flavorNotes, string? weight);
    }
}
