namespace CNPM_TTN.Dtos
{
    public class ProductRequest
    {
        public int Id { get; set; } 
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int CategoryId { get; set; }

     
        public ProductDetailRequest ProductDetail { get; set; } = null!;
    }
}