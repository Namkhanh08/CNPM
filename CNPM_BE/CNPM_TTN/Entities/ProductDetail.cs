using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class ProductDetail
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string? Region { get; set; }

    public string? Process { get; set; }

    public string? Roast { get; set; }

    public string? FlavorNotes { get; set; }

    public byte? AcidityLevel { get; set; }

    public byte? BitternessLevel { get; set; }

    public byte? BodyLevel { get; set; }

    public string? BestTime { get; set; }

    public string? MatchTags { get; set; }

    /// <summary>
    /// Danh sách khối lượng, phân cách bằng dấu phẩy. Ví dụ: "250g,500g,1kg"
    /// </summary>
    public string? WeightOptions { get; set; }

    public string? TraceabilityData { get; set; }

    public int? FarmingZoneId { get; set; }

    public virtual FarmingZone? FarmingZone { get; set; }

    public virtual Product Product { get; set; } = null!;
}
