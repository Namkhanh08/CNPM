using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class Subscription
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public int ProductId { get; set; }

    public int? GrindingOptionId { get; set; }

    public string? FlavorNotes { get; set; }

    public string? Weight { get; set; }

    public int Quantity { get; set; }

    public string Frequency { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public DateTime NextDeliveryDate { get; set; }

    public string? ReceiverName { get; set; }

    public string? ReceiverPhone { get; set; }

    public string? ShippingProvince { get; set; }

    public string? ShippingDistrict { get; set; }

    public string? ShippingWard { get; set; }

    public string? ShippingDetailAddress { get; set; }

    public string? PaymentMethod { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public string? DeliveryDay { get; set; }

    public int CommitmentMonths { get; set; }

    public DateTime? CommitmentEndDate { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual ICollection<SubscriptionConfig> SubscriptionConfigs { get; set; } = new List<SubscriptionConfig>();

    public virtual ICollection<SubscriptionOrder> SubscriptionOrders { get; set; } = new List<SubscriptionOrder>();

    public virtual User User { get; set; } = null!;
}
