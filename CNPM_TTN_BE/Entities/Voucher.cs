using System;
using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Entities
{
    public class Voucher
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string DiscountType { get; set; } = string.Empty; // "percent", "fixed", "shipping"

        public decimal DiscountValue { get; set; }

        public decimal? MaxDiscount { get; set; }

        public decimal MinOrderValue { get; set; }

        public int UsedCount { get; set; }

        public int UsageLimit { get; set; }

        public string? PaymentMethod { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; }
    }
}