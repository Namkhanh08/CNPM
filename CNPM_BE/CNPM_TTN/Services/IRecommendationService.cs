using System.Threading.Tasks;
using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IRecommendationService
    {
        Task<RecommendationResponseDto> GetRecommendationAsync(RecommendationRequestDto request);
    }
}
