using System.Collections.Generic;

namespace CNPM_TTN.Dtos
{
    public class DashboardDto
    {
        // --- CÁC SỐ LIỆU CŨ CỦA BẠN ---
        public decimal ExpectedRevenue { get; set; }
        public int PendingOrders { get; set; }
        public List<Entities.Order> LatestOrders { get; set; } = new();
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<RevenueTimelineDto> RevenueHistory { get; set; } = new();
        public decimal RevenueGrowthRate { get; set; }
        public bool IsStockLow { get; set; }

        // --- CÁC CHỈ SỐ MỚI BỔ SUNG ---
        public decimal ActualRevenue { get; set; } // Doanh thu thực tế (Đơn "Hoàn thành")
        public decimal CancellationRate { get; set; } // Tỷ lệ hủy đơn (%)
        public decimal FulfillmentRate { get; set; } // Tỷ lệ hoàn thành đơn (%)
        public decimal OnlinePaymentRate { get; set; } // Tỷ lệ thanh toán Online (%)
        public Dictionary<string, int> OrderStatusSummary { get; set; } = new(); // Thống kê số lượng theo trạng thái
    }
}