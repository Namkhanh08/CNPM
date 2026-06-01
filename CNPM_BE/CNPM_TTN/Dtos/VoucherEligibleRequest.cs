namespace CNPM_TTN.Dtos
{
    public class VoucherEligibilityRequest
    {
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
        public string PaymentMethod { get; set; } = string.Empty;
    }
}