namespace CNPM_TTN.Dtos
{
    public class ProductUserResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string Type { get; set; } = "N/A";
        public ProductDetailUserResponse? Details { get; set; }
    }

    public class ProductDetailUserResponse
    {
        public string? Region { get; set; }
        public string? Process { get; set; }
        public string? Roast { get; set; }
        public string? FlavorNotes { get; set; }
        public string? Weight { get; set; }
        public string? Height { get; set; }
        public byte? AcidityLevel { get; set; }
        public byte? BitternessLevel { get; set; }
        public byte? BodyLevel { get; set; }

        
        public List<GrindingOptionResponse> GrindingOptions { get; set; } = new List<GrindingOptionResponse>();
    }

    public class GrindingOptionResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}