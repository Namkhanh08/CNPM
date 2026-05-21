using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("RawMaterialLogs")]
    public partial class RawMaterialLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RawMaterialId { get; set; }

        public int? ReceiptId { get; set; }

        [Required]
        [StringLength(100)]
        public string Action { get; set; }

        [Required]
        public double OldQuantity { get; set; } 

        [Required]
        public double NewQuantity { get; set; }

        [StringLength(500)]
        public string Reason { get; set; }

        [StringLength(450)]
        public string ModifiedBy { get; set; } 

        [Required]
        public DateTime ModifiedDate { get; set; } = DateTime.Now;



        [ForeignKey("RawMaterialId")]
        public virtual RawMaterial RawMaterial { get; set; }

        [ForeignKey("ReceiptId")]
        public virtual InventoryReceipt InventoryReceipt { get; set; }

        [ForeignKey("ModifiedBy")]
        public virtual User User { get; set; } 
    }
}