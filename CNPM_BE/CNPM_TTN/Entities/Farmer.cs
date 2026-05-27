using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class Farmer
{
    public int Id { get; set; }

    public int FarmingZoneId { get; set; }

    public string Name { get; set; } = null!;

    public string? Scale { get; set; }

    public string? FarmingMethod { get; set; }

    public string? Story { get; set; }

    public virtual ICollection<FarmerCertification> FarmerCertifications { get; set; } = new List<FarmerCertification>();

    public virtual FarmingZone FarmingZone { get; set; } = null!;

    public virtual ICollection<HarvestBatch> HarvestBatches { get; set; } = new List<HarvestBatch>();
}
