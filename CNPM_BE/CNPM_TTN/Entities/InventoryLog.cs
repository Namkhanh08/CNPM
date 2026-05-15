using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class InventoryLog
{
    [Key]
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string? Action { get; set; }

    public int OldQuantity { get; set; }

    public int NewQuantity { get; set; }

    public string? ModifiedBy { get; set; }

    public DateTime ModifiedDate { get; set; }

    [StringLength(450)]
    public string? UserId { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("InventoryLogs")]
    public virtual Product Product { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("InventoryLogs")]
    public virtual User? User { get; set; }
}
