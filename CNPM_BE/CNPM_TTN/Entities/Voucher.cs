using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class Voucher
{
    public int Id { get; set; }

    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string DiscountType { get; set; } = null!;

    public decimal DiscountValue { get; set; }

    public decimal MinOrderValue { get; set; }

    public int MaxUsage { get; set; }

    public int UsedCount { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public decimal? MaxDiscount { get; set; }

    public int? UsageLimit { get; set; }

    public string? PaymentMethod { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
}
