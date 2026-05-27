using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class RoastingBatch
{
    public int Id { get; set; }

    public string BatchCode { get; set; } = null!;

    public int ProductId { get; set; }

    public string? RoastLevel { get; set; }

    public double? InputWeight { get; set; }

    public string? Status { get; set; }

    public DateTime? RoastDate { get; set; }

    public string? UserId { get; set; }

    public int? InventoryReceiptId { get; set; }

    public double? OutputWeight { get; set; }

    public string? TraceabilityData { get; set; }

    public virtual InventoryReceipt? InventoryReceipt { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual User? User { get; set; }
}
