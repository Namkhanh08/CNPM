using System;
using System.Collections.Generic;

namespace CNPM_TTN.Entities;

public partial class SubscriptionOrder
{
    public int Id { get; set; }

    public int SubscriptionId { get; set; }

    public DateTime DeliveryDate { get; set; }

    public string SnapshotDetails { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public string? ReceiverName { get; set; }

    public string? ReceiverPhone { get; set; }

    public string? ShippingAddress { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public decimal FinalPrice { get; set; }

    public virtual Subscription Subscription { get; set; } = null!;
}
