using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("RawMaterialLogs")]
    public partial class RawMaterialLog
    {
        
        public int Id { get; set; }

      
        public int RawMaterialId { get; set; }

        public int? ReceiptId { get; set; }

        public string Action { get; set; }

    
        public double OldQuantity { get; set; } 

  
        public double NewQuantity { get; set; }

  
        public string Reason { get; set; }

   
        public string ModifiedBy { get; set; } 

  
        public DateTime ModifiedDate { get; set; } = DateTime.Now;



        [ForeignKey("RawMaterialId")]
        public virtual RawMaterial RawMaterial { get; set; }

        [ForeignKey("ReceiptId")]
        public virtual InventoryReceipt InventoryReceipt { get; set; }

        [ForeignKey("ModifiedBy")]
        public virtual User User { get; set; } 
    }
}