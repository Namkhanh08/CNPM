using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("InventoryReceipts")]
    public class InventoryReceipt
    {
       
        public int Id { get; set; }

       
        public int RawMaterialId { get; set; }

        [ForeignKey("RawMaterialId")]
        public virtual RawMaterial RawMaterial { get; set; }

        
        public string Supplier { get; set; }

      
        public double Quantity { get; set; }

    
        public double RemainingQuantity { get; set; }

    
        public DateTime ImportDate { get; set; }

     
        public DateTime ExpiryDate { get; set; }

        public string? CreatedBy { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? User { get; set; }

        public virtual ICollection<RoastingBatch> RoastingBatches { get; set; } = new List<RoastingBatch>();
    }
}