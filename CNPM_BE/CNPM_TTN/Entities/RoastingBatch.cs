using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class RoastingBatch
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string BatchCode { get; set; } = null!;

    public int ProductId { get; set; }

    [StringLength(50)]
    public string? RoastLevel { get; set; }

    public double? InputWeight { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? RoastDate { get; set; }

    [StringLength(450)]
    public string? UserId { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("RoastingBatches")]
    public virtual Product Product { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("RoastingBatches")]
    public virtual User? User { get; set; }
}
