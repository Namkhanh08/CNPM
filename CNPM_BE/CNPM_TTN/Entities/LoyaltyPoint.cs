using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class LoyaltyPoint
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public int Points { get; set; }

    public string Type { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int? OrderId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
