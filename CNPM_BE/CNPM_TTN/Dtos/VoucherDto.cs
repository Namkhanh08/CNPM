using System;

namespace CNPM_TTN.Dtos
{
    // DTO trả về cho Client 
    public class VoucherDto
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
    }

    // DTO dùng khi tạo hoặc cập nhật Voucher 
    public class CreateUpdateVoucherDto
    {
        public string Code { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string DiscountType { get; set; } 
        public decimal DiscountValue { get; set; }
        public decimal MaxDiscount { get; set; }
        public decimal MinOrderValue { get; set; }
        public int UsageLimit { get; set; }
        public string PaymentMethod { get; set; }
        public bool IsActive { get; set; }

        // Đã sửa thành kiểu string để nhận chuỗi "22/05/2026 03:16 CH" an toàn
        public string StartDate { get; set; }
        public string EndDate { get; set; }
    }

    // DTO dùng kiểm tra voucher khả dụng dựa trên đơn hàng hiện tại
    public class CheckAvailableVoucherDto
    {
        public decimal OrderTotal { get; set; }
        public string PaymentMethod { get; set; }
    }
}