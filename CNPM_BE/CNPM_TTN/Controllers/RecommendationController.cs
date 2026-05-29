using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/recommendation")]
    [ApiController]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        [HttpPost]
        public async Task<IActionResult> GetRecommendation([FromBody] RecommendationRequestDto request)
        {
            var result = await _recommendationService.GetRecommendationAsync(request);
            return Ok(ApiResponse<RecommendationResponseDto>.SuccessResponse(result));
        }
    }
}
