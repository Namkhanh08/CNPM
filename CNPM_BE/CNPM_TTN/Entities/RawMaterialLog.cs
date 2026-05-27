using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class RawMaterialLog
{
    public int Id { get; set; }

    public int RawMaterialId { get; set; }

    public int? ReceiptId { get; set; }

    public string Action { get; set; } = null!;

    public double OldQuantity { get; set; }

    public double NewQuantity { get; set; }

    public string? Reason { get; set; }

    public string? ModifiedBy { get; set; }

    public DateTime ModifiedDate { get; set; }

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual RawMaterial RawMaterial { get; set; } = null!;

    public virtual InventoryReceipt? Receipt { get; set; }
}
