using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    public class SubscriptionConfig
    {
        [Key]
        public int Id { get; set; }

        public int SubscriptionId { get; set; }
        public int ProductId { get; set; }
        public string? FlavorNote { get; set; }
        public int? GrindType { get; set; }
        public string? Weight { get; set; }
        public int Quantity { get; set; }

        [ForeignKey("SubscriptionId")]
        public virtual Subscription? Subscription { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}