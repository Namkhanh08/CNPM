using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class SubscriptionConfig
{
    public int Id { get; set; }

    public int SubscriptionId { get; set; }

    public int ProductId { get; set; }

    public string? FlavorNote { get; set; }

    public int? GrindType { get; set; }

    public string? Weight { get; set; }

    public int Quantity { get; set; }

    public virtual GrindingOption? GrindTypeNavigation { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual Subscription Subscription { get; set; } = null!;
}
