using System.Collections.Generic;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Dtos
{
    public class DashboardDto
    {
        public decimal ExpectedRevenue { get; set; }
        public int PendingOrders { get; set; }
        public List<Order> LatestOrders { get; set; } = new List<Order>();
        public List<TopProductDto> TopProducts { get; set; } = new List<TopProductDto>();
        public List<RevenueTimelineDto> RevenueHistory { get; set; } = new();

        public decimal RevenueGrowthRate { get; set; } // Phần trăm tăng trưởng doanh thu
        public bool IsStockLow { get; set; }
    }
}