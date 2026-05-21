using System;
using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Dtos;

// ========== VOUCHER ==========

public class VoucherDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; }
    public int MaxUsage { get; set; }
    public int UsedCount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class CreateVoucherDto
{
    [Required] public string Code { get; set; } = string.Empty;
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public string DiscountType { get; set; } = "percent"; // "percent" | "amount"
    [Range(0.01, double.MaxValue)] public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; } = 0;
    public int MaxUsage { get; set; } = 0;
    [Required] public DateTime StartDate { get; set; }
    [Required] public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public class VoucherValidateResponseDto
{
    public bool IsValid { get; set; }
    public decimal DiscountAmount { get; set; }
    public string Message { get; set; } = string.Empty;
    public VoucherDto? Voucher { get; set; }
}

// ========== LOYALTY ==========

public class LoyaltyInfoDto
{
    public int TotalPoints { get; set; }
    public string MemberTier { get; set; } = string.Empty;
    public int PointsToNextTier { get; set; }
    public string NextTier { get; set; } = string.Empty;
    public List<LoyaltyHistoryDto> History { get; set; } = new();
}

public class LoyaltyHistoryDto
{
    public int Points { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class RedeemPointsDto
{
    [Range(1, int.MaxValue)]
    public int Points { get; set; }
}

// ========== SUBSCRIPTION ==========

public class SubscriptionDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductImage { get; set; }
    public int? GrindingOptionId { get; set; }
    public string? FlavorNotes { get; set; }
    public string? Weight { get; set; }
    public int Quantity { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime NextDeliveryDate { get; set; }
    public string? ReceiverName { get; set; }
    public string? ReceiverPhone { get; set; }
    public string? ShippingProvince { get; set; }
    public string? ShippingDistrict { get; set; }
    public string? ShippingWard { get; set; }
    public string? ShippingDetailAddress { get; set; }
    public string? PaymentMethod { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateSubscriptionDto
{
    [Required] public int ProductId { get; set; }
    public int? GrindingOptionId { get; set; }
    public string? FlavorNotes { get; set; }
    public string? Weight { get; set; }
    [Range(1, 100)] public int Quantity { get; set; } = 1;
    [Required] public string Frequency { get; set; } = "monthly";
    [Required] public DateTime StartDate { get; set; }
    public string? ReceiverName { get; set; }
    public string? ReceiverPhone { get; set; }
    public string? ShippingProvince { get; set; }
    public string? ShippingDistrict { get; set; }
    public string? ShippingWard { get; set; }
    public string? ShippingDetailAddress { get; set; }
    public string? PaymentMethod { get; set; }
}
