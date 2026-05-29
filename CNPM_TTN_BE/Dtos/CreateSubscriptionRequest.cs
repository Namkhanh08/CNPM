using System;
using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Dtos
{
    public class CreateSubscriptionRequest
    {
        public int ProductId { get; set; }
        public string? FlavorNotes { get; set; }
        public int GrindType { get; set; }
        public string? Weight { get; set; }
        public int Quantity { get; set; }

        public string Frequency { get; set; } = string.Empty;       // '1week', '2weeks', '4weeks'
        public string DeliveryDay { get; set; } = string.Empty;     // 'Thứ Ba', 'Thứ Bảy'
        public string Commitment { get; set; } = string.Empty;      // 'pay-as-you-go', '3months', '6months'
        public string PaymentMethod { get; set; } = string.Empty;

        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
    }
}