using CNPM_TTN.Dtos;
using CNPM_TTN.Repositories;

namespace CNPM_TTN.Services
{
    public class DashboardService
    {
        private readonly OrderRepository _oRepo;

        public DashboardService(OrderRepository oRepo)
        {
            _oRepo = oRepo;
        }

        public DashboardDto GetDashboardData()
        {
            return new DashboardDto
            {
                // Dữ liệu cũ
                ExpectedRevenue = _oRepo.GetExpectedRevenue(),
                PendingOrders = _oRepo.GetPendingOrdersCount(),
                LatestOrders = _oRepo.GetLatestOrders(),
                TopProducts = _oRepo.GetTopProducts(),
                RevenueHistory = _oRepo.GetRevenueLast7Days(),
                RevenueGrowthRate = _oRepo.GetRevenueGrowthRate(),
                IsStockLow = _oRepo.CheckLowStockStatus(),

                // DỮ LIỆU MỚI THÊM THEO YÊU CẦU
                ActualRevenue = _oRepo.GetActualRevenue(),
                OrderStatusSummary = _oRepo.GetOrderStatusSummary(),
                CancellationRate = _oRepo.GetCancellationRate(),
                FulfillmentRate = _oRepo.GetFulfillmentRate(),
                OnlinePaymentRate = _oRepo.GetOnlinePaymentRate()
            };
        }
    }
}