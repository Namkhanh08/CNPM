using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class CartItem
{
    [Key]
    public int Id { get; set; }

    public int CartId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public int? GrindingOptionId { get; set; }

    [StringLength(100)]
    public string? FlavorNotes { get; set; }

    [ForeignKey("CartId")]
    [InverseProperty("CartItems")]
    public virtual Cart Cart { get; set; } = null!;

    [ForeignKey("GrindingOptionId")]
    [InverseProperty("CartItems")]
    public virtual GrindingOption? GrindingOption { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("CartItems")]
    public virtual Product Product { get; set; } = null!;
}
