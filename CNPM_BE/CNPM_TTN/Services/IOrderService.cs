using System.Collections.Generic;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderFromCartAsync(string userId, OrderRequestDto dto);
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId);
        Task<Order?> GetOrderByIdAsync(int orderId, string userId);
        Task<Order> CancelOrderAsync(int orderId, string userId);
        Task<Order> CompleteOrderAsync(int orderId, string userId);
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<Order> UpdateOrderStatusAsync(int orderId, string status);
    }
}
