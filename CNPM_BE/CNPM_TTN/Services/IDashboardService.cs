using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync();
    }
}
