namespace CNPM_TTN.Dtos
{
    public class CartResponseDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;

        public List<CartItemResponseDto> Items { get; set; } = new();
    }

    public class CartItemResponseDto
    {
        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public int GrindingOptionId { get; set; }

        public string? FlavorNotes { get; set; }

        public string? Weight { get; set; }

        public ProductCartDto Product { get; set; } = new();
    }

    public class ProductCartDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }
    }
}