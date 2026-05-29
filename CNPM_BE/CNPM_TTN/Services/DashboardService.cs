using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ShopCoffeeContext _context;

        public DashboardService(ShopCoffeeContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync()
        {
            var today = DateTime.Today;

            var revenueOrders = _context.Orders
                .Where(order => order.Status.ToLower() != "cancelled");

            var totalRevenue = await revenueOrders.SumAsync(order => order.TotalAmount);

            var pendingOrders = await _context.Orders
                .CountAsync(order =>
                    order.Status.ToLower() == "unpaid" ||
                    order.Status.ToLower() == "processing");

            var totalStock = await _context.Products.SumAsync(product => product.Stock);

            var newUsersToday = await _context.Users
                .CountAsync(user => user.Created.Date == today);

            var recentOrders = await _context.Orders
                .Include(order => order.User)
                .OrderByDescending(order => order.OrderDate)
                .Take(5)
                .Select(order => new DashboardOrderDto
                {
                    Id = order.Id,
                    CustomerName = order.ReceiverName ?? order.User.Name,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    OrderDate = order.OrderDate
                })
                .ToListAsync();

            var topProducts = await _context.OrderDetails
                .Include(detail => detail.Product)
                .Include(detail => detail.Order)
                .Where(detail => detail.Order.Status.ToLower() != "cancelled")
                .GroupBy(detail => new
                {
                    detail.ProductId,
                    detail.Product.Name,
                    detail.Product.Stock
                })
                .Select(group => new TopProductDto
                {
                    ProductId = group.Key.ProductId,
                    Name = group.Key.Name,
                    Stock = group.Key.Stock,
                    Sales = group.Sum(detail => detail.Quantity)
                })
                .OrderByDescending(product => product.Sales)
                .Take(5)
                .ToListAsync();

            return new DashboardSummaryDto
            {
                TotalRevenue = totalRevenue,
                PendingOrders = pendingOrders,
                TotalStock = totalStock,
                NewUsersToday = newUsersToday,
                RecentOrders = recentOrders,
                TopProducts = topProducts
            };
        }

        public async Task<IEnumerable<DailyRevenueDto>> GetRevenueChartAsync(int? days, DateTime? startDate, DateTime? endDate)
        {
            DateTime fromDate;
            DateTime toDate = DateTime.Today;
            int totalDays;

            if (startDate.HasValue && endDate.HasValue)
            {
                fromDate = startDate.Value.Date;
                toDate = endDate.Value.Date;

                if (toDate < fromDate)
                {
                    var temp = fromDate;
                    fromDate = toDate;
                    toDate = temp;
                }

                totalDays = (toDate - fromDate).Days + 1;
                if (totalDays > 365)
                {
                    totalDays = 365;
                    fromDate = toDate.AddDays(-364);
                }
            }
            else
            {
                totalDays = days ?? 7;
                if (totalDays <= 0 || totalDays > 365) totalDays = 7;
                fromDate = DateTime.Today.AddDays(-(totalDays - 1));
            }

            // Lấy doanh thu từng ngày từ DB
            var rawData = await _context.Orders
                .Where(o => o.Status.ToLower() != "cancelled" && o.OrderDate.Date >= fromDate && o.OrderDate.Date <= toDate)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrderCount = g.Count()
                })
                .ToListAsync();

            // Tạo đầy đủ N ngày (kể cả ngày không có đơn)
            var result = Enumerable.Range(0, totalDays)
                .Select(i =>
                {
                    var date = fromDate.AddDays(i);
                    var match = rawData.FirstOrDefault(r => r.Date == date);
                    return new DailyRevenueDto
                    {
                        Date = date.ToString("dd/MM", System.Globalization.CultureInfo.InvariantCulture),
                        Revenue = match?.Revenue ?? 0,
                        OrderCount = match?.OrderCount ?? 0
                    };
                });

            return result;
        }
    }
}
