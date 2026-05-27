using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public decimal Price { get; set; }

    public int Stock { get; set; }

    public string ImageUrl { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int CategoryId { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<ProductDetail> ProductDetails { get; set; } = new List<ProductDetail>();

    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();

    public virtual ICollection<RoastingBatch> RoastingBatches { get; set; } = new List<RoastingBatch>();

    public virtual ICollection<SubscriptionConfig> SubscriptionConfigs { get; set; } = new List<SubscriptionConfig>();

    public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();

    public virtual ICollection<GrindingOption> GrindingOptions { get; set; } = new List<GrindingOption>();

    public virtual ICollection<Voucher> Vouchers { get; set; } = new List<Voucher>();
}
