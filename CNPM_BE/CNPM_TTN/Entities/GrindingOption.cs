using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class GrindingOption
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual ICollection<SubscriptionConfig> SubscriptionConfigs { get; set; } = new List<SubscriptionConfig>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
