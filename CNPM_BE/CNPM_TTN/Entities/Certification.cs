using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class Certification
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Issuer { get; set; }

    public string? LogoUrl { get; set; }

    public virtual ICollection<FarmerCertification> FarmerCertifications { get; set; } = new List<FarmerCertification>();
}
