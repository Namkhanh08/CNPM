namespace CNPM_TTN.Dtos
{
    public class UpdateOrderDto
    {
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string ShippingProvince { get; set; } = string.Empty;
        public string ShippingDistrict { get; set; } = string.Empty;
        public string ShippingWard { get; set; } = string.Empty;
        public string ShippingDetailAddress { get; set; } = string.Empty;
        public string? ShippingNote { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}