using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities;

public partial class RawMaterial
{
    [Key]
    public int Id { get; set; }

    [StringLength(150)]
    public string Name { get; set; } = null!;

    [StringLength(20)]
    public string Unit { get; set; } = "kg";

    public int CategoryId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedDate { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("RawMaterials")]
    public virtual Category Category { get; set; } = null!;

    [InverseProperty("RawMaterial")]
    public virtual ICollection<InventoryReceipt> InventoryReceipts { get; set; } = new List<InventoryReceipt>();

    [InverseProperty("RawMaterial")]
    public virtual ICollection<RawMaterialLog> RawMaterialLogs { get; set; } = new List<RawMaterialLog>();
}
