using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    public class Cart
    {
        [Key]

        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public List<CartItem> Items { get; set; } = new List<CartItem>();

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
