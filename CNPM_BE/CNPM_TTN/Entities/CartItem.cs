using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("CartItems")]
    public partial class CartItem
    {
        [Key]
        public int Id { get; set; }

        public int CartId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public int? GrindingOptionId { get; set; }

        public string? FlavorNotes { get; set; }

        public string? Weight { get; set; }

        // Ràng buộc chính xác khóa ngoại trỏ về bảng Carts
        [ForeignKey("CartId")]
        public virtual Cart Cart { get; set; } = null!;

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

        [ForeignKey("GrindingOptionId")]
        public virtual GrindingOption? GrindingOption { get; set; }
    }
}