using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class RawMaterial
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Unit { get; set; } = null!;

    public int CategoryId { get; set; }

    public DateTime CreatedDate { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<HarvestBatch> HarvestBatches { get; set; } = new List<HarvestBatch>();

    public virtual ICollection<InventoryReceipt> InventoryReceipts { get; set; } = new List<InventoryReceipt>();

    public virtual ICollection<RawMaterialLog> RawMaterialLogs { get; set; } = new List<RawMaterialLog>();
}
