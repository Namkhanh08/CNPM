using CNPM_TTN.Dtos;

using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IOrderRepository
    {
        // Admin: Lấy danh sách kèm phân trang, tìm kiếm, lọc trạng thái
        Task<PagedOrderResultDto> GetAllOrdersAdminAsync(int page, string searchTerm, string status);

        // User: Lấy danh sách đơn cá nhân
        Task<IEnumerable<OrderDto>> GetMyOrdersAsync(string userId);

        // Chi tiết đơn
        Task<OrderDto?> GetOrderByIdAsync(int id);

        // Cập nhật trạng thái (Xác nhận, Giao hàng, Hoàn thành...)
        Task<bool> UpdateOrderStatusAsync(int id, string status);

        // Tạo đơn hàng mới
        Task<OrderDto?> CreateOrderAsync(string userId, CreateOrderDto dto);

        // Hủy đơn hàng
        Task<bool> CancelOrderAsync(int orderId);

        // Shipper: Lấy danh sách đơn cần giao
        Task<PagedOrderResultDto> GetShipperOrdersAsync(int page, string searchTerm);
        Task<bool> UpdateOrderAsync(int id, UpdateOrderDto dto);
    }
}