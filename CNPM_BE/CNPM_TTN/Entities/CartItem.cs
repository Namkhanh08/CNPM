using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class CartItem
{
    public int Id { get; set; }

    public int CartId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public int? GrindingOptionId { get; set; }

    public string? FlavorNotes { get; set; }

    public string? Weight { get; set; }

    public int? ProductVariantId { get; set; }

    public virtual Cart Cart { get; set; } = null!;

    public virtual GrindingOption? GrindingOption { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual ProductVariant? ProductVariant { get; set; }
}
