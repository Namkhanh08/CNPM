using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Security.Claims;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Services;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("api/carts")]
    public class CartsController : ControllerBase
    {
        private readonly CartService _cartSer;

        public CartsController(CartService cartSer)
        {
            _cartSer = cartSer;
        }

        private string GetUserIdFromClaims()
        {

            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }

        [HttpGet]
        public IActionResult GetCart()
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không thể xác định định danh người dùng từ Token." });

            var cart = _cartSer.GetCart(userId);

            if (cart == null)
            {
                return Ok(new CartResponseDto
                {
                    Id = 0,
                    UserId = userId,
                    Items = new List<CartItemResponseDto>()
                });
            }

            return Ok(cart);
        }

        [HttpPost("add")]
        public IActionResult AddToCart([FromBody] AddToCartDto dto)
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                _cartSer.AddToCart(userId, dto.ProductId, dto.Quantity, dto.GrindingOptionId, dto.FlavorNotes, dto.Weight);
                return Ok(new { message = "Đã thêm vào giỏ hàng" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update")]
        public IActionResult UpdateCart([FromBody] AddToCartDto dto)
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            _cartSer.UpdateCartItem(userId, dto.ProductId, dto.Quantity, dto.GrindingOptionId, dto.FlavorNotes, dto.Weight);
            return Ok(new { message = "Đã cập nhật giỏ hàng" });
        }

        [HttpDelete("remove")]
        public IActionResult RemoveItem([FromBody] AddToCartDto dto)
        {
            _cartSer.RemoveItem(dto.ProductId, dto.GrindingOptionId, dto.FlavorNotes, dto.Weight);
            return Ok(new { message = "Đã xóa sản phẩm" });
        }
    }
}