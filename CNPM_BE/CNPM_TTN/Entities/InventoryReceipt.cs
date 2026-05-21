using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("InventoryReceipts")]
    public class InventoryReceipt
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RawMaterialId { get; set; }

        [ForeignKey("RawMaterialId")]
        public virtual RawMaterial RawMaterial { get; set; }

        [Required]
        [StringLength(250)]
        public string Supplier { get; set; }

        [Required]
        public double Quantity { get; set; }

        [Required]
        public double RemainingQuantity { get; set; }

        [Required]
        public DateTime ImportDate { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        public string? CreatedBy { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? User { get; set; }

        public virtual ICollection<RoastingBatch> RoastingBatches { get; set; } = new List<RoastingBatch>();
    }
}