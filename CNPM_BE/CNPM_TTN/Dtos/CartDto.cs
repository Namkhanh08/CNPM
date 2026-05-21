using System.Collections.Generic;

namespace CNPM_TTN.Dtos
{
    public class CartRequestDto
    {
        public int Id { get; set; }
        public int? CartItemId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int? GrindingOptionId { get; set; }
        public string? FlavorNotes { get; set; }
        public string? Weight { get; set; }
    }

    public class CartResponseDto
    {
        public List<CartItemResponseDto> Items { get; set; } = new();
    }

    public class CartItemResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? GrindingOptionId { get; set; }
        public string? FlavorNotes { get; set; }
        public string? Weight { get; set; }
        public int Quantity { get; set; }
        public CartProductDto Product { get; set; } = null!;
    }

    public class CartProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = null!;
    }
}
