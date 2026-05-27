using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class FarmerCertification
{
    public int FarmerId { get; set; }

    public int CertificationId { get; set; }

    public DateOnly? IssueDate { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public string? DocumentUrl { get; set; }

    public virtual Certification Certification { get; set; } = null!;

    public virtual Farmer Farmer { get; set; } = null!;
}
