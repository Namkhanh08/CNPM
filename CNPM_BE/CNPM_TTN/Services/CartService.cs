using System;
using System.Collections.Generic;
using CNPM_TTN.Repositories;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepo;

        public CartService(ICartRepository cartRepo)
        {
            _cartRepo = cartRepo;
        }

        public Cart? GetCart(string userId)
        {
            // Repository đã dùng Include nạp đầy đủ thông tin, không cần gán thủ công nữa
            return _cartRepo.FindByUserId(userId);
        }

        public void AddToCart(string userId, int productId, int quantity, int grindingOptionId, string? flavorNotes, string? weight)
        {
            if (quantity <= 0)
            {
                throw new Exception("Số lượng phải lớn hơn 0!!!");
            }

            var cart = _cartRepo.FindByUserId(userId);

            if (cart == null)
            {
                _cartRepo.CreateCart(userId);
                cart = _cartRepo.FindByUserId(userId);
            }

            var cartItem = _cartRepo.FindByCartAndProduct(cart!.Id, productId, grindingOptionId, flavorNotes, weight);
            if (cartItem != null)
            {
                int newQuantity = cartItem.Quantity + quantity;
                _cartRepo.UpdateQuantity(userId, cartItem.ProductId, newQuantity, grindingOptionId, flavorNotes, weight);
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = productId,
                    Quantity = quantity,
                    GrindingOptionId = grindingOptionId,
                    FlavorNotes = flavorNotes,
                    Weight = weight
                };
                _cartRepo.AddItem(newItem);
            }
        }

        public void UpdateCartItem(string userId, int productId, int quantity, int grindingOptionId, string? flavorNotes, string? weight)
        {
            if (quantity <= 0)
            {
                _cartRepo.DeleteItem(productId, grindingOptionId, flavorNotes, weight);
            }
            else
            {
                _cartRepo.UpdateQuantity(userId, productId, quantity, grindingOptionId, flavorNotes, weight);
            }
        }

        public void RemoveItem(int productId, int grindingOptionId, string? flavorNotes, string? weight)
        {
            _cartRepo.DeleteItem(productId, grindingOptionId, flavorNotes, weight);
        }
    }
}