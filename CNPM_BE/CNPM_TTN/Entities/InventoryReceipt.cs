using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities;

public partial class InventoryReceipt
{
    [Key]
    public int Id { get; set; }

    public int RawMaterialId { get; set; }

    [StringLength(250)]
    public string Supplier { get; set; } = null!;

    public double Quantity { get; set; }

    public double RemainingQuantity { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime ImportDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime ExpiryDate { get; set; }

    [StringLength(450)]
    public string? CreatedBy { get; set; }

    [ForeignKey("RawMaterialId")]
    [InverseProperty("InventoryReceipts")]
    public virtual RawMaterial RawMaterial { get; set; } = null!;

    [ForeignKey("CreatedBy")]
    [InverseProperty("InventoryReceipts")]
    public virtual User? CreatedByNavigation { get; set; }

    [InverseProperty("InventoryReceipt")]
    public virtual ICollection<RawMaterialLog> RawMaterialLogs { get; set; } = new List<RawMaterialLog>();

    [InverseProperty("InventoryReceipt")]
    public virtual ICollection<RoastingBatch> RoastingBatches { get; set; } = new List<RoastingBatch>();
}
