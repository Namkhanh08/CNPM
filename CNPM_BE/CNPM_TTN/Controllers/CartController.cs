using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("api/carts")]
    [Authorize] // Kích hoạt bộ lọc bảo mật mặc định: Yêu cầu phải gửi kèm JWT hợp lệ
    public class CartsController : ControllerBase
    {
        private readonly ICartService _cartSer;

        public CartsController(ICartService cartSer)
        {
            _cartSer = cartSer;
        }

        /// <summary>
        /// Hàm helper lấy nhanh UserId trực tiếp từ Identity Claims đã được .NET Middleware bóc tách và xác thực thành công.
        /// </summary>
        private string GetUserIdFromClaims()
        {
            // Vì TokenHelper của bạn add: new Claim(ClaimTypes.NameIdentifier, userId)
            // Nên ở đây ta gọi đúng ClaimTypes.NameIdentifier là sẽ lấy được chuỗi Guid tương ứng.
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }

        // 1. GET: api/carts
        // 1. GET: api/carts
        [HttpGet]
        public IActionResult GetCart()
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không thể xác định định danh người dùng từ Token." });

            var cart = _cartSer.GetCart(userId);

            // Nếu User chưa từng có giỏ hàng, trả về mảng rỗng để React không bị lỗi .length hay .map
            if (cart == null)
            {
                return Ok(new List<object>());
            }

            // ĐÃ SỬA: Trả thẳng về một DANH SÁCH (Array) các item phù hợp với biến `cart` trong useStore của React
            var safeCartItemsResult = cart.CartItems.Select(item => new
            {
                // Giữ nguyên các trường định danh cấp item để làm Key
                Id = item.Id,
                CartId = item.CartId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                GrindingOptionId = item.GrindingOptionId,
                FlavorNotes = item.FlavorNotes,
                Weight = item.Weight,

                // Ép Object Product trả về viết hoa chữ cái đầu trúng với code React đang gọi
                Product = item.Product != null ? new
                {
                    Id = item.Product.Id,
                    Name = item.Product.Name,
                    Price = item.Product.Price,
                    ImageUrl = item.Product.ImageUrl // Trả ra đúng ImageUrl viết hoa chữ đầu
                } : null,

                GrindingOption = item.GrindingOption != null ? new
                {
                    Id = item.GrindingOption.Id,
                    Name = item.GrindingOption.Name
                } : null
            }).ToList();

            return Ok(safeCartItemsResult);
        }

        // 2. POST: api/carts/add
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

        // 3. PUT: api/carts/update
        [HttpPut("update")]
        public IActionResult UpdateCart([FromBody] AddToCartDto dto)
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            _cartSer.UpdateCartItem(userId, dto.ProductId, dto.Quantity, dto.GrindingOptionId, dto.FlavorNotes, dto.Weight);
            return Ok(new { message = "Đã cập nhật giỏ hàng" });
        }

        // 4. DELETE: api/carts/remove
        [HttpDelete("remove")]
        public IActionResult RemoveItem([FromBody] AddToCartDto dto)
        {
            _cartSer.RemoveItem(dto.ProductId, dto.GrindingOptionId, dto.FlavorNotes, dto.Weight);
            return Ok(new { message = "Đã xóa sản phẩm" });
        }
    }
}