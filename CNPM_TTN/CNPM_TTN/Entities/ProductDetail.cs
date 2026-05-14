using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class ProductDetail
{
    [Key]
    public int Id { get; set; }

    public int ProductId { get; set; }

    [StringLength(255)]
    public string? Region { get; set; }

    [StringLength(255)]
    public string? Process { get; set; }

    [StringLength(100)]
    public string? Roast { get; set; }

    public string? FlavorNotes { get; set; }

    public byte? AcidityLevel { get; set; }

    public byte? BitternessLevel { get; set; }

    public byte? BodyLevel { get; set; }

    [StringLength(50)]
    public string? BestTime { get; set; }

    [StringLength(500)]
    public string? MatchTags { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("ProductDetails")]
    public virtual Product Product { get; set; } = null!;
}
