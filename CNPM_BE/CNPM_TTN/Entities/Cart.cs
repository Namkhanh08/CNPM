using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("Carts")]
    public partial class Cart
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = null!;

        // Chỉ giữ lại một danh sách duy nhất trỏ sang CartItem
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}