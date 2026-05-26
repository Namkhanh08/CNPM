using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Thêm thư viện này

namespace CNPM_TTN.Entities
{
    public class OrderDetail
    {
        [Key]
        public int Id { get; set; }

        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? FlavorNotes { get; set; }
        public int GrindingOptionId { get; set; }
        public string? Weight { get; set; }

        // Chặn không cho tuần tự hóa thuộc tính trỏ ngược này sang JSON
        [JsonIgnore]
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}