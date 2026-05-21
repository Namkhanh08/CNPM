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
    }
}
