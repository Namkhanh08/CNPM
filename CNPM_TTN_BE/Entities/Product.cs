using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; } // Dùng decimal cho tiền tệ chính xác hơn Double
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
    }
}