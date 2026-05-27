using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Entities
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; } = DateTime.Now;

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public string ReceiverName { get; set; } = string.Empty;

        public string ReceiverPhone { get; set; } = string.Empty;

        public string ShippingProvince { get; set; } = string.Empty;

        public string ShippingDistrict { get; set; } = string.Empty;

        public string ShippingWard { get; set; } = string.Empty;

        public string ShippingDetailAddress { get; set; } = string.Empty;

        public string? ShippingNote { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string? VoucherCode { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal FinalAmount { get; set; }

        // Navigation Property cho EF Core Relationship
        public List<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}