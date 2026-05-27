namespace CNPM_TTN.Entities
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
            public string Description { get; set; }
        public string DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal MaxDiscount { get; set; }
        public decimal MinOrderValue { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public string PaymentMethod { get; set; }
        public bool IsActive { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
 