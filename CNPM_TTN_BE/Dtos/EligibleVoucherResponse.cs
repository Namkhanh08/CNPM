namespace CNPM_TTN.Dtos
{
    public class EligibleVoucherResponse
    {
        public long Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountPreview { get; set; }
    }
}