using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    public class ProductDetail
    {
        [Key]
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? Region { get; set; } = string.Empty;
        public string? Process { get; set; } = string.Empty;
        public string? Roast { get; set; } = string.Empty;
        public string? FlavorNotes { get; set; } = string.Empty;
        public string? Weight { get; set; } = string.Empty;
        public string? Height { get; set; } = string.Empty;

        // Navigation Properties
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
        public List<GrindingOption> GrindingOptions { get; set; } = new List<GrindingOption>();
    }
}