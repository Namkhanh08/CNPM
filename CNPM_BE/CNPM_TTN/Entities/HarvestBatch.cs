using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class HarvestBatch
{
    public int Id { get; set; }

    public string BatchCode { get; set; } = null!;

    public int FarmerId { get; set; }

    public int RawMaterialId { get; set; }

    public DateOnly HarvestDate { get; set; }

    public string ProcessingMethod { get; set; } = null!;

    public decimal? QualityScore { get; set; }

    public string? Notes { get; set; }

    public virtual Farmer Farmer { get; set; } = null!;

    public virtual ICollection<InventoryReceipt> InventoryReceipts { get; set; } = new List<InventoryReceipt>();

    public virtual RawMaterial RawMaterial { get; set; } = null!;
}
