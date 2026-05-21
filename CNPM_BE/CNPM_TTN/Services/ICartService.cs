using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Services
{
    public interface ICartService
    {
        Task<Cart> GetCartAsync(string userId);
        Task<Cart> AddToCartAsync(string userId, int productId, int quantity, int ? grindingOptionId,string ? flavorNotes);
        Task<Cart> UpdateCartItemQuantityAsync(string userId, int cartItemId,int quantity );
        Task<Cart> RemoveFromCartAsync(string userId, int cartItemId);


    }
}
