using System.Collections.Generic;

namespace CNPM_TTN.Dtos
{
    public class RecommendationRequestDto
    {
        public string Roast { get; set; } = string.Empty;       // "light", "medium", "dark"
        public string Flavor { get; set; } = string.Empty;      // "floral", "chocolate", "bold"
        public string Method { get; set; } = string.Empty;      // "phin", "espresso", "pour"
        public string TimeOfDay { get; set; } = string.Empty;   // "morning", "afternoon", "evening"
    }

    public class RecommendationResultDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public List<string> FlavorNotes { get; set; } = [];
        public int MatchScore { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class RecommendationResponseDto
    {
        public RecommendationResultDto MainSuggestion { get; set; } = null!;
        public List<RecommendationResultDto> OtherSuggestions { get; set; } = [];
    }
}
