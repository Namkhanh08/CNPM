using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

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
        public string? Region { get; set; }
        public int SoldCount { get; set; }
    }

    public class ProductDetailDto
    {
        public int Id { get; set; }
        public ProductDto Product { get; set; } = null!;
        public string? Region { get; set; }
        public string? Process { get; set; }
        public string? Roast { get; set; }
        public string? FlavorNotes { get; set; }
        public byte? AcidityLevel { get; set; }
        public byte? BitternessLevel { get; set; }
        public byte? BodyLevel { get; set; }
        public string? BestTime { get; set; }
        public string? MatchTags { get; set; }
        public string? WeightOptions { get; set; }
        public string? Altitude { get; set; }
        public string? TraceabilityData { get; set; }
        public List<GrindingOptionDto> GrindingOption { get; set; } = new();
    }

    public class GrindingOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }

    public class ProductDetailInputDto
    {
        [StringLength(255)]
        public string? Region { get; set; }

        [StringLength(255)]
        public string? Process { get; set; }

        [StringLength(100)]
        public string? Roast { get; set; }

        public string? FlavorNotes { get; set; }

        [Range(0, 5)]
        public byte? AcidityLevel { get; set; }

        [Range(0, 5)]
        public byte? BitternessLevel { get; set; }

        [Range(0, 5)]
        public byte? BodyLevel { get; set; }

        [StringLength(50)]
        public string? BestTime { get; set; }

        [StringLength(500)]
        public string? MatchTags { get; set; }

        /// <summary>Danh sách khối lượng, phân cách bằng dấu phẩy. Ví dụ: "250g,500g,1kg"</summary>
        [StringLength(200)]
        public string? WeightOptions { get; set; }

        public string? TraceabilityData { get; set; }
    }

    public class CreateProductDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        [StringLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [StringLength(4000)]
        public string Description { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }

        public ProductDetailInputDto? ProductDetail { get; set; }
    }

    public class UpdateProductDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        [StringLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [StringLength(4000)]
        public string Description { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }

        public ProductDetailInputDto? ProductDetail { get; set; }
    }

    public class ProductFilterDto
    {
        public string? SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public string? Roast { get; set; }
        public string? Region { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } // "price", "name", "newest", "sold", "popular", etc.
        public bool Descending { get; set; } = false;
    }
}
