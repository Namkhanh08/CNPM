using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class InventoryReceipt
{
    public int Id { get; set; }

    public int RawMaterialId { get; set; }

    public string Supplier { get; set; } = null!;

    public double Quantity { get; set; }

    public double RemainingQuantity { get; set; }

    public DateTime ImportDate { get; set; }

    public DateTime ExpiryDate { get; set; }

    public string? CreatedBy { get; set; }

    public int? HarvestBatchId { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual HarvestBatch? HarvestBatch { get; set; }

    public virtual RawMaterial RawMaterial { get; set; } = null!;

    public virtual ICollection<RawMaterialLog> RawMaterialLogs { get; set; } = new List<RawMaterialLog>();

    public virtual ICollection<RoastingBatch> RoastingBatches { get; set; } = new List<RoastingBatch>();
}
