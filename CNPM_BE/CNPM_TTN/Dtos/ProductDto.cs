using System.Collections.Generic;

namespace CNPM_TTN.Dtos
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int CategoryId { get; set; }
    }

    public class ProductDetailDto
    {
        public int Id { get; set; }
        public ProductDto Product { get; set; } = null!;
        public string? Region { get; set; }
        public string? Process { get; set; }
        public string? Roast { get; set; }
        public string? FlavorNotes { get; set; }
        public List<GrindingOptionDto> GrindingOption { get; set; } = new();
    }

    public class GrindingOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int CategoryId { get; set; }
    }

    public class UpdateProductDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int CategoryId { get; set; }
    }
}