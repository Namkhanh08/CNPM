using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    public class SubscriptionOrder
    {
        [Key]
        public int Id { get; set; }

        public int SubscriptionId { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string SnapshotDetails { get; set; } = string.Empty; // Lưu chuỗi JSON snapshot
        public string Status { get; set; } = string.Empty; // PENDING_PAYMENT, PAID, v.v.
        public DateTime CreatedAt { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal FinalPrice { get; set; }

        [ForeignKey("SubscriptionId")]
        public virtual Subscription? Subscription { get; set; }
    }
}