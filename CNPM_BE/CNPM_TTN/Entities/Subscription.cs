using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    public class Subscription
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string DeliveryDay { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // ACTIVE, SKIPPED, CANCELLED
        public DateTime NextDeliveryDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CommitmentMonths { get; set; }
        public DateTime? CommitmentEndDate { get; set; }

        public virtual List<SubscriptionConfig> Configs { get; set; } = new List<SubscriptionConfig>();
        public virtual List<SubscriptionOrder> Orders { get; set; } = new List<SubscriptionOrder>();

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}