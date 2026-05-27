using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class OrderDetail
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public string? FlavorNotes { get; set; }

    public int? GrindingOptionId { get; set; }

    public string? Weight { get; set; }

    public int? ProductVariantId { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;

    public virtual ProductVariant? ProductVariant { get; set; }
}
