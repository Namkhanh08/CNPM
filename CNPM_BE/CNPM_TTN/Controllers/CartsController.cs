using System;
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
    [Route("api/carts")]
    [Authorize]
    [ApiController]
    public class CartsController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartsController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // Lấy User Id từ Claims
        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private CartResponseDto MapToResponseDto(Cart cart)
        {
            return new CartResponseDto
            {
                Items = cart.CartItems.Select(ci => new CartItemResponseDto
                {
                    Id = ci.Id,
                    ProductId = ci.ProductId,
                    GrindingOptionId = ci.GrindingOptionId,
                    FlavorNotes = ci.FlavorNotes,
                    Weight = "250g", // DB chưa lưu weight nên mockup giá trị mặc định cho FE không bị lỗi
                    Quantity = ci.Quantity,
                    Product = new CartProductDto
                    {
                        Id = ci.Product.Id,
                        Name = ci.Product.Name,
                        Price = ci.Product.Price,
                        ImageUrl = ci.Product.ImageUrl
                    }
                }).ToList()
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var cart = await _cartService.GetCartAsync(userId);
            return Ok(MapToResponseDto(cart));
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] CartRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var cart = await _cartService.AddToCartAsync(userId, dto.ProductId, dto.Quantity, dto.GrindingOptionId, dto.FlavorNotes);
                return Ok(MapToResponseDto(cart));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.FailureResponse(ex.Message));
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] CartRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var cartItemId = dto.CartItemId ?? dto.Id;
                var cart = await _cartService.UpdateCartItemQuantityAsync(userId, cartItemId, dto.Quantity);
                return Ok(MapToResponseDto(cart));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.FailureResponse(ex.Message));
            }
        }

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveCartItem([FromBody] CartRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var cartItemId = dto.CartItemId ?? dto.Id;
                var cart = await _cartService.RemoveFromCartAsync(userId, cartItemId);
                return Ok(MapToResponseDto(cart));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.FailureResponse(ex.Message));
            }
        }
    }
}
