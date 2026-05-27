using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        public int CartId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public string? FlavorNotes { get; set; }
        public int GrindingOptionId { get; set; }
        public string? Weight { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

    }
}
