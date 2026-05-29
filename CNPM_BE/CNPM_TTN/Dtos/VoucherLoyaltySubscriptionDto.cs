using System;
using System.Collections.Generic;
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
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int? UsageLimit { get; set; }
    public string? PaymentMethod { get; set; }
    public bool IsExpired { get; set; }
    public int RemainingUsage { get; set; }
    public List<int> ProductIds { get; set; } = new();
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
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int? UsageLimit { get; set; }
    public string? PaymentMethod { get; set; }
    public List<int> ProductIds { get; set; } = new();
}

public class VoucherValidateResponseDto
{
    public bool IsValid { get; set; }
    public decimal DiscountAmount { get; set; }
    public string Message { get; set; } = string.Empty;
    public VoucherDto? Voucher { get; set; }
}

public class VoucherValidateRequestDto
{
    [Required] public string Code { get; set; } = string.Empty;
    [Range(0, double.MaxValue)] public decimal OrderTotal { get; set; }
    public string? PaymentMethod { get; set; }
    public List<int> ProductIds { get; set; } = new();
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
    public decimal Price { get; set; }
    public int? GrindingOptionId { get; set; }
    public string? FlavorNotes { get; set; }
    public string? Flavor { get; set; }
    public string? GrindType { get; set; }
    public string? Weight { get; set; }
    public int Quantity { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime NextDeliveryDate { get; set; }
    public string NextBilling { get; set; } = string.Empty;
    public string CardInfo { get; set; } = "COD";
    public string History { get; set; } = string.Empty;
    public object? Product { get; set; }
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

public class SubscriptionAdminDto : SubscriptionDto
{
    public string? UserEmail { get; set; }
    public string? UserFullName { get; set; }
}

public class SubscriptionStatusUpdateDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}

public class UpdateSubscriptionConfigDto
{
    public string? Flavor { get; set; }
    public string? FlavorNote { get; set; }
    public int? GrindingOptionId { get; set; }
    public int? GrindTypeId { get; set; }
    public string? GrindType { get; set; }
    public string? Weight { get; set; }
    [Range(1, 100)]
    public int? Quantity { get; set; }
}
