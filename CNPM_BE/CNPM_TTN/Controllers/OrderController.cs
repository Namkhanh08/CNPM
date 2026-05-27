

using CNPM_TTN.Dtos;
using CNPM_TTN.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("orders")]
    [Authorize] 
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;

        public OrderController(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.Identity?.Name ?? "Thành viên";
        }

        
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetCurrentUserId();
            var orders = await _orderRepository.GetMyOrdersAsync(userId);
            return Ok(orders);
        }

        [HttpGet("admin/all")]
        public async Task<IActionResult> FetchAllOrdersAdmin([FromQuery] int page = 1, [FromQuery] string searchTerm = "", [FromQuery] string status = "all")
        {
            var result = await _orderRepository.GetAllOrdersAdminAsync(page, searchTerm, status);
            return Ok(result);
        }

    
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromQuery] string status)
        {
            if (string.IsNullOrEmpty(status)) return BadRequest("Trạng thái trống.");

            var success = await _orderRepository.UpdateOrderStatusAsync(id, status);
            if (!success) return NotFound("Không tìm thấy đơn hàng cần cập nhật.");

            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }

  
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _orderRepository.GetOrderByIdAsync(id);
            if (order == null) return NotFound("Đơn hàng không tồn tại.");
            return Ok(order);
        }


        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userId = GetCurrentUserId();
            var newOrder = await _orderRepository.CreateOrderAsync(userId, dto);
            if (newOrder == null) return BadRequest("Tạo đơn hàng không thành công. Vui lòng kiểm tra lại sản phẩm.");
            return Ok(newOrder);
        }

   
        [HttpPut("{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var success = await _orderRepository.CancelOrderAsync(orderId);
            if (!success) return BadRequest("Không thể hủy đơn hàng này (Đơn đã được xác nhận hoặc không tồn tại).");
            return Ok("Hủy đơn hàng thành công!");
        }

      
        [HttpGet("shipper/list")]
        public async Task<IActionResult> FetchShipperOrders([FromQuery] int page = 1, [FromQuery] string searchTerm = "")
        {
            var result = await _orderRepository.GetShipperOrdersAsync(page, searchTerm);
            return Ok(result);
        }

        [HttpPut("{id}/shipping-complete")]
        public async Task<IActionResult> ShipperCompleteOrder(int id)
        {
            var success = await _orderRepository.UpdateOrderStatusAsync(id, "Hoàn thành");
            if (!success) return NotFound("Cập nhật thất bại.");
            return Ok("Giao hàng thành công!");
        }

        [HttpPut("{id}/shipper-fail")]
        public async Task<IActionResult> ShipperFailOrder(int id)
        {
            var success = await _orderRepository.UpdateOrderStatusAsync(id, "Chờ xử lý"); 
            if (!success) return NotFound("Cập nhật thất bại.");
            return Ok("Đã cập nhật trạng thái giao thất bại.");
        }
        [HttpPut("edit/{id}")]
public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderDto dto)
{
    // Kiểm tra tính hợp lệ
    if (dto == null) return BadRequest("Dữ liệu không hợp lệ.");

    // Gọi Repository để cập nhật
    var success = await _orderRepository.UpdateOrderAsync(id, dto);
    
    if (!success) 
        return NotFound("Không tìm thấy đơn hàng hoặc không thể cập nhật (có thể đơn hàng đã ở trạng thái không được phép chỉnh sửa).");

    return Ok(new { message = "Cập nhật đơn hàng thành công." });
}
    }
}