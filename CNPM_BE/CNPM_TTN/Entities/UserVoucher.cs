using System;

namespace CNPM_TTN.Entities;

public partial class UserVoucher
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public int VoucherId { get; set; }

    public int? OrderId { get; set; }

    public bool IsUsed { get; set; }

    public DateTime AssignedAt { get; set; }

    public DateTime? UsedAt { get; set; }

    public string Source { get; set; } = "public";

    public virtual User User { get; set; } = null!;

    public virtual Voucher Voucher { get; set; } = null!;

    public virtual Order? Order { get; set; }
}
