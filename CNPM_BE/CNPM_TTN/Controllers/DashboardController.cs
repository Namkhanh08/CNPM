using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "1")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _dashboardService.GetSummaryAsync();
            return Ok(ApiResponse<DashboardSummaryDto>.SuccessResponse(summary));
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueChart(
            [FromQuery] int? days,
            [FromQuery] string? startDate,
            [FromQuery] string? endDate)
        {
            DateTime? start = null;
            DateTime? end = null;

            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParseExact(startDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var parsedStart))
            {
                start = parsedStart;
            }

            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParseExact(endDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var parsedEnd))
            {
                end = parsedEnd;
            }

            var data = await _dashboardService.GetRevenueChartAsync(days, start, end);
            return Ok(ApiResponse<IEnumerable<DailyRevenueDto>>.SuccessResponse(data));
        }
    }
}
