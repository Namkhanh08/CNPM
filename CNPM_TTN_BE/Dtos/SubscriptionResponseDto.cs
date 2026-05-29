using System;

namespace CNPM_TTN.Dtos
{
    public class SubscriptionResponseDto
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string NextBilling { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? CardInfo { get; set; }
        public string? Flavor { get; set; }
        public string GrindType { get; set; } = string.Empty;
        public string? Weight { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public int DeliveryStep { get; set; }
        public string History { get; set; } = string.Empty;
    }
}