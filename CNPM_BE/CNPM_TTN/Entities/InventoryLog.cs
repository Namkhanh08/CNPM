using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class InventoryLog
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string? Action { get; set; }

    public int OldQuantity { get; set; }

    public int NewQuantity { get; set; }

    public string? ModifiedBy { get; set; }

    public DateTime ModifiedDate { get; set; }

    public string? UserId { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual User? User { get; set; }
}
