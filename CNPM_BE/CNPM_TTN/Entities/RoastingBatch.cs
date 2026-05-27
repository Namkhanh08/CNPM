using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class RoastingBatch
{
    
    public int Id { get; set; }

    public string BatchCode { get; set; } = null!;

    public int ProductId { get; set; }


    public string? RoastLevel { get; set; }

    public double? InputWeight { get; set; }

   
    public string? Status { get; set; }

    public int? InventoryReceiptId { get; set; }

    public DateTime? RoastDate { get; set; }

    
    public string? UserId { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("RoastingBatches")]
    public virtual Product Product { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("RoastingBatches")]
    public virtual User? User { get; set; }

    public virtual InventoryReceipt? InventoryReceipt { get; set; }
    public double? OutputWeight { get; set; }
}
