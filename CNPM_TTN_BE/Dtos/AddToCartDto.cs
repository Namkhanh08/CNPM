namespace CNPM_TTN.Dtos
{
    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? FlavorNotes { get; set; }
        public int GrindingOptionId { get; set; }
        public string? Weight { get; set; }
    }
}
