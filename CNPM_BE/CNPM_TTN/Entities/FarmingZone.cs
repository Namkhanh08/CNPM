using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class FarmingZone
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Province { get; set; } = null!;

    public string? Altitude { get; set; }

    public string? SoilType { get; set; }

    public string? Climate { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public virtual ICollection<Farmer> Farmers { get; set; } = new List<Farmer>();

    public virtual ICollection<ProductDetail> ProductDetails { get; set; } = new List<ProductDetail>();
}
