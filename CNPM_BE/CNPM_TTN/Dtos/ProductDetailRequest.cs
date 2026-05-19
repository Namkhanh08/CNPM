namespace CNPM_TTN.Dtos
{
    public class ProductDetailRequest
    {
        public string? Region { get; set; }
        public string? Process { get; set; }
        public string? Roast { get; set; }
        public string? FlavorNotes { get; set; }
        public byte? AcidityLevel { get; set; }
        public byte? BitternessLevel { get; set; }
        public byte? BodyLevel { get; set; }
        public string? BestTime { get; set; }
        public string? MatchTags { get; set; }
    }
}