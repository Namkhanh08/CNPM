using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities;

public class Subscription
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(450)]
    public string UserId { get; set; } = null!;

    public int ProductId { get; set; }

    public int? GrindingOptionId { get; set; }

    [StringLength(200)]
    public string? FlavorNotes { get; set; }

    [StringLength(50)]
    public string? Weight { get; set; }

    public int Quantity { get; set; } = 1;

    /// <summary>"weekly" | "biweekly" | "monthly"</summary>
    [Required]
    [StringLength(20)]
    public string Frequency { get; set; } = "monthly";

    public DateTime StartDate { get; set; }

    public DateTime NextDeliveryDate { get; set; }

    [StringLength(100)]
    public string? ReceiverName { get; set; }

    [StringLength(20)]
    public string? ReceiverPhone { get; set; }

    [StringLength(100)]
    public string? ShippingProvince { get; set; }

    [StringLength(100)]
    public string? ShippingDistrict { get; set; }

    [StringLength(100)]
    public string? ShippingWard { get; set; }

    [StringLength(255)]
    public string? ShippingDetailAddress { get; set; }

    [StringLength(100)]
    public string? PaymentMethod { get; set; }

    /// <summary>"active" | "paused" | "cancelled"</summary>
    [StringLength(20)]
    public string Status { get; set; } = "active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
