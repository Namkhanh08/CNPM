using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities;

public partial class RawMaterialLog
{
    [Key]
    public int Id { get; set; }

    public int RawMaterialId { get; set; }

    public int? ReceiptId { get; set; }

    [StringLength(100)]
    public string Action { get; set; } = null!;

    public double OldQuantity { get; set; }

    public double NewQuantity { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }

    [StringLength(450)]
    public string? ModifiedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime ModifiedDate { get; set; }

    [ForeignKey("RawMaterialId")]
    [InverseProperty("RawMaterialLogs")]
    public virtual RawMaterial RawMaterial { get; set; } = null!;

    [ForeignKey("ReceiptId")]
    [InverseProperty("RawMaterialLogs")]
    public virtual InventoryReceipt? InventoryReceipt { get; set; }

    [ForeignKey("ModifiedBy")]
    [InverseProperty("RawMaterialLogs")]
    public virtual User? ModifiedByNavigation { get; set; }
}
