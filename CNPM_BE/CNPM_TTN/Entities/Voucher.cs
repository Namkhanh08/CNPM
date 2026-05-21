using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities;

public class Voucher
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    /// <summary>"percent" hoặc "amount"</summary>
    [Required]
    [StringLength(20)]
    public string DiscountType { get; set; } = "percent";

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MinOrderValue { get; set; } = 0;

    public int MaxUsage { get; set; } = 0; // 0 = không giới hạn

    public int UsedCount { get; set; } = 0;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; } = true;
}
