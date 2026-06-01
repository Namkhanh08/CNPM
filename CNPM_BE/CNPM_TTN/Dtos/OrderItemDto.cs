namespace CNPM_TTN.Dtos
{
    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int GrindingOptionId { get; set; }
        public string? FlavorNotes { get; set; }
        public string? Weight { get; set; }
    }
}
