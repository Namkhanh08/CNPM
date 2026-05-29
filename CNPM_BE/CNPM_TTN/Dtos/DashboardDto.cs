namespace CNPM_TTN.Dtos
{
    public class DashboardSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public int PendingOrders { get; set; }
        public int TotalStock { get; set; }
        public int NewUsersToday { get; set; }
        public IEnumerable<DashboardOrderDto> RecentOrders { get; set; } = [];
        public IEnumerable<TopProductDto> TopProducts { get; set; } = [];
    }

    public class DashboardOrderDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Sales { get; set; }
        public int Stock { get; set; }
    }

    public class DailyRevenueDto
    {
        public string Date { get; set; } = string.Empty;   // "dd/MM"
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }
}
