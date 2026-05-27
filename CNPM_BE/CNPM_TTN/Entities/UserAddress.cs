using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class UserAddress
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public string ReceiverName { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Province { get; set; } = null!;

    public string District { get; set; } = null!;

    public string Ward { get; set; } = null!;

    public string DetailAddress { get; set; } = null!;

    public bool IsDefault { get; set; }

    public virtual User User { get; set; } = null!;
}
