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
    }
}