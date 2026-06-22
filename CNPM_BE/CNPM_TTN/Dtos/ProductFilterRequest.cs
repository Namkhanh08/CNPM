namespace CNPM_TTN.Dtos
{
    public class ProductFilterRequest
    {
        public string? Search { get; set; }

        // nhiều category
        public List<int> CategoryIds { get; set; } = new();

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        // all | instock | lowstock | outstock
        public string Status { get; set; } = "all";
    }
}
