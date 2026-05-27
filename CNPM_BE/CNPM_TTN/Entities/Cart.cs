using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class Cart
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual User User { get; set; } = null!;
}
