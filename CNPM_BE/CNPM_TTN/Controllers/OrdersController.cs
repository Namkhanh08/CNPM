using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private OrderResponseDto MapToResponseDto(Order order)
        {
            return new OrderResponseDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                ReceiverEmail = order.ReceiverEmail,
                ShippingProvince = order.ShippingProvince,
                ShippingDistrict = order.ShippingDistrict,
                ShippingWard = order.ShippingWard,
                ShippingDetailAddress = order.ShippingDetailAddress,
                ShippingNote = order.ShippingNote,
                PaymentMethod = order.PaymentMethod,
                VoucherCode = order.VoucherCode,
                DiscountAmount = order.DiscountAmount,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailResponseDto
                {
                    Id = od.Id,
                    ProductId = od.ProductId,
                    ProductName = od.Product != null ? od.Product.Name : "Sản phẩm đã bị xóa",
                    ProductImageUrl = od.Product != null ? od.Product.ImageUrl : "",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    FlavorNotes = od.FlavorNotes,
                    GrindingOptionId = od.GrindingOptionId
                }).ToList()
            };
        }

        // ================= USER ENDPOINTS =================

        [HttpGet("api/orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            var response = orders.Select(MapToResponseDto).ToList();
            return Ok(response);
        }

        [HttpGet("api/orders/{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var order = await _orderService.GetOrderByIdAsync(id, userId);
            if (order == null) return NotFound(ApiResponse<string>.FailureResponse("Không tìm thấy đơn hàng."));

            return Ok(MapToResponseDto(order));
        }

        [HttpPost("api/orders")]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var order = await _orderService.CreateOrderFromCartAsync(userId, dto);
                return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, MapToResponseDto(order));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.FailureResponse(ex.Message));
            }
        }

        [HttpPut("api/orders/{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var order = await _orderService.CancelOrderAsync(id, userId);
                return Ok(MapToResponseDto(order));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.FailureResponse(ex.Message));
            }
        }

        [HttpPut("api/orders/{id}/complete")]
        public async Task<IActionResult> CompleteOrder(int id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var order = await _orderService.CompleteOrderAsync(id, userId);
                return Ok(MapToResponseDto(order));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.FailureResponse(ex.Message));
            }
        }

        // ================= ADMIN/STAFF ENDPOINTS =================

        [HttpGet("api/admin/orders")]
        [Authorize(Roles = "1")] // Chỉ Admin/Staff (Role = 1) được xem
        public async Task<IActionResult> GetAdminOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            var response = orders.Select(MapToResponseDto).ToList();
            return Ok(response);
        }

        [HttpPut("api/admin/orders/{id}/status")]
        [Authorize(Roles = "1")] // Chỉ Admin/Staff (Role = 1) được sửa
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto dto)
        {
            try
            {
                var order = await _orderService.UpdateOrderStatusAsync(id, dto.Status);
                return Ok(MapToResponseDto(order));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.FailureResponse(ex.Message));
            }
        }
    }
}
