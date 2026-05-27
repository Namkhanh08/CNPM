namespace CNPM_TTN.Dtos
{

    public class OrderDetailDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!; // Lấy từ Product.Name
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? FlavorNotes { get; set; }
        public int? GrindingOptionId { get; set; }
        public string? Weight { get; set; }
            public string? ProductImageUrl { get; set; } 
    }

    public class OrderDto
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
        public decimal? DiscountAmount { get; set; }
        public decimal? FinalAmount { get; set; }

        // Match với thuộc tính "OrderDetails" viết hoa chữ cái đầu trong React Map
        public List<OrderDetailDto> OrderDetails { get; set; } = new List<OrderDetailDto>();
    }

    // DTO trả về kết quả phân trang cho Admin/Shipper
    public class PagedOrderResultDto
    {
        public List<OrderDto> Orders { get; set; } = new List<OrderDto>();
        public int TotalItems { get; set; }
    }

    // DTO nhận dữ liệu tạo Đơn hàng mới từ Client
    public class CreateOrderDto
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
        public List<CreateOrderDetailDto> Items { get; set; } = new List<CreateOrderDetailDto>();
    }

    public class CreateOrderDetailDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? FlavorNotes { get; set; }
        public int? GrindingOptionId { get; set; }
        public string? Weight { get; set; }
    }
    // Trong namespace CNPM_TTN.Dtos
    public class UpdateOrderDto
    {
        public string? ReceiverName { get; set; }
        public string? ReceiverPhone { get; set; }
        public string? ShippingProvince { get; set; }
        public string? ShippingDistrict { get; set; }
        public string? ShippingWard { get; set; }
        public string? ShippingDetailAddress { get; set; }
        public string? ShippingNote { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
