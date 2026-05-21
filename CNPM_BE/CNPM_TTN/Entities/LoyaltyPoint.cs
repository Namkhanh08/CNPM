using System;
using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Entities;

public class LoyaltyPoint
{
    public int Id { get; set; }

    [Required]
    [StringLength(450)]
    public string UserId { get; set; } = null!;

    public int Points { get; set; }

    /// <summary>"earn" = tích điểm, "redeem" = đổi điểm</summary>
    [StringLength(20)]
    public string Type { get; set; } = "earn";

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public int? OrderId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
}
