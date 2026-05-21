using System;
using System.Collections.Generic;

namespace CNPM_TTN.Dtos
{
    public class OrderRequestDto
    {
        public string? ReceiverName { get; set; }
        public string? ReceiverPhone { get; set; }
        public string? ReceiverEmail { get; set; }
        public string? ShippingProvince { get; set; }
        public string? ShippingDistrict { get; set; }
        public string? ShippingWard { get; set; }
        public string? ShippingDetailAddress { get; set; }
        public string? ShippingNote { get; set; }
        public string? PaymentMethod { get; set; }
        public string? VoucherCode { get; set; }
    }

    public class OrderStatusUpdateDto
    {
        public string Status { get; set; } = null!;
    }

    public class OrderResponseDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = null!;
        public string? ReceiverName { get; set; }
        public string? ReceiverPhone { get; set; }
        public string? ReceiverEmail { get; set; }
        public string? ShippingProvince { get; set; }
        public string? ShippingDistrict { get; set; }
        public string? ShippingWard { get; set; }
        public string? ShippingDetailAddress { get; set; }
        public string? ShippingNote { get; set; }
        public string? PaymentMethod { get; set; }
        public string? VoucherCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public List<OrderDetailResponseDto> OrderDetails { get; set; } = new();
    }

    public class OrderDetailResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string ProductImageUrl { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? FlavorNotes { get; set; }
        public int? GrindingOptionId { get; set; }
    }
}
