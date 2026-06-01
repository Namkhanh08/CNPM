﻿using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;

        public OrdersController(OrderService orderService)
        {
            _orderService = orderService;
        }

        private string GetUserIdFromClaims()
        {
            // Trích xuất tự động Sub/Id từ JWT Bearer Token được cấu hình trong hệ thống
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? User.FindFirst("sub")?.Value
                   ?? string.Empty;
        }

        [HttpGet]
        public IActionResult GetMyOrders()
        {
            string userId = GetUserIdFromClaims();
            return Ok(_orderService.GetMyOrders(userId));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                return Ok(_orderService.GetById(id));
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("all")]
        public IActionResult GetAll() => Ok(_orderService.GetAllOrders());

        [HttpPost]
        public IActionResult CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                string userId = GetUserIdFromClaims();
                var result = _orderService.CreateOrder(userId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateOrder(int id, [FromBody] UpdateOrderDto dto)
        {
            try
            {
                return Ok(_orderService.UpdateOrder(id, dto));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, [FromQuery] string status)
        {
            try
            {
                return Ok(_orderService.UpdateStatus(id, status));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/cancel")]
        public IActionResult CancelOrder(int id)
        {
            try
            {
                _orderService.CancelOrder(id);
                return Ok(new { message = "Hủy đơn hàng thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==================== ADMIN ENDPOINTS ====================
        [HttpGet("admin/all")]
        public IActionResult GetAllAdmin([FromQuery] int page = 1, [FromQuery] string? searchTerm = null, [FromQuery] string status = "all")
        {
            return Ok(_orderService.GetAllOrdersAdmin(page, searchTerm, status));
        }

        [HttpPut("{id}/confirm")]
        public IActionResult ConfirmOrder(int id)
        {
            try
            {
                return Ok(_orderService.ConfirmOrder(id));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==================== SHIPPER ENDPOINTS ====================
        [HttpPut("{id}/shipping-complete")]
        public IActionResult ShipperComplete(int id)
        {
            try
            {
                return Ok(_orderService.ShipperCompleteOrder(id));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/shipper-fail")]
        public IActionResult ShipperFail(int id)
        {
            try
            {
                return Ok(_orderService.ShipperFailOrder(id));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("shipper/list")]
        public IActionResult GetShipperOrders([FromQuery] int page = 1, [FromQuery] string? searchTerm = null)
        {
            return Ok(_orderService.GetShipperOrders(page, searchTerm));
        }
    }
}