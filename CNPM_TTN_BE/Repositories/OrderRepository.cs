using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using CNPM_TTN.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CNPM_TTN.Repositories
{
    public class OrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<Order> GetByUserId(string userId)
        {
            return _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToList();
        }

        public Order? GetById(int orderId)
        {
            return _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefault(o => o.Id == orderId);
        }

        public List<Order> GetAll()
        {
            return _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToList();
        }

        public List<OrderDetail> GetByOrder(int orderId)
        {
            return _context.OrderDetails
                .Include(od => od.Product)
                .Where(od => od.OrderId == orderId)
                .ToList();
        }

        public void Create(Order order)
        {
            // EF Core tự động xử lý lấy Identity ID của Order nạp vào OrderDetails
            _context.Orders.Add(order);
            _context.SaveChanges();
        }

        public void Update(Order order)
        {
            _context.Orders.Update(order);
            _context.SaveChanges();
        }

        // TÍNH TOÁN CHO ADMIN DASHBOARD
        public decimal GetExpectedRevenue()
        {
            return _context.Orders
                .Where(o => o.Status != "Chờ thanh toán" && o.Status != "Đã hủy")
                .Sum(o => (decimal?)o.TotalAmount) ?? 0;
        }

        public int GetPendingOrdersCount()
        {
            return _context.Orders.Count(o => o.Status != "Đã hủy" || o.Status != "Hoàn thành");
        }

        public List<Order> GetLatestOrders()
        {
            return _context.Orders
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .ToList();
        }
        public List<TopProductDto> GetTopProducts()
        {
            return _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .Where(od => od.Order!.Status != "Đã hủy")
                .GroupBy(od => new
                {
                    od.ProductId,
                    ProductName = od.Product!.Name,
                    ImageUrl = od.Product!.ImageUrl
                })
                .Select(g => new TopProductDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    ImageUrl = g.Key.ImageUrl,
                    TotalSold = g.Sum(od => od.Quantity)
                })
                .OrderByDescending(p => p.TotalSold)
                .Take(5)
                .ToList();
        }

        public List<RevenueTimelineDto> GetRevenueLast7Days()
        {
            var sevenDaysAgo = DateTime.Today.AddDays(-6);

            return _context.Orders
                .Where(o => o.OrderDate >= sevenDaysAgo && o.Status != "Chờ thanh toán" && o.Status != "Đã hủy")
                .Select(o => new { o.OrderDate, o.TotalAmount }) // Chỉ lấy các cột cần thiết để tối ưu hiệu năng
                .AsEnumerable() // Chuyển sang xử lý trên bộ nhớ (Client-side) để tránh lỗi dịch LINQ to SQL
                .GroupBy(o => o.OrderDate.Date) // Gom nhóm theo ngày cực kỳ an toàn
                .Select(g => new RevenueTimelineDto
                {
                    Date = g.Key.ToString("dd/MM"), // Hàm ToString() chạy mượt mà trên RAM
                    Amount = g.Sum(o => (decimal?)o.TotalAmount) ?? 0
                })
                .OrderBy(r => r.Date)
                .ToList();
        }

        // 1. Tính toán % tăng trưởng doanh thu hôm nay so với hôm qua
        public decimal GetRevenueGrowthRate()
        {
            var today = DateTime.Today;
            var yesterday = today.AddDays(-1);

            // Doanh thu hôm nay
            var revenueToday = _context.Orders
                .Where(o => o.OrderDate >= today && o.Status != "Chờ thanh toán" && o.Status != "Đã hủy")
                .Sum(o => (decimal?)o.TotalAmount) ?? 0;

            // Doanh thu hôm qua
            var revenueYesterday = _context.Orders
                .Where(o => o.OrderDate >= yesterday && o.OrderDate < today && o.Status != "Chờ thanh toán" && o.Status != "Đã hủy")
                .Sum(o => (decimal?)o.TotalAmount) ?? 0;

            if (revenueYesterday == 0)
                return revenueToday > 0 ? 100 : 0; // Nếu hôm qua không bán được gì mà hôm nay bán được thì tính là tăng 100%

            // Công thức tính tăng trưởng: ((Hôm nay - Hôm qua) / Hôm qua) * 100
            return Math.Round(((revenueToday - revenueYesterday) / revenueYesterday) * 100, 1);
        }

        // 2. Kiểm tra kho xem có sản phẩm nào sắp hết hàng không (Ví dụ số lượng < 10)
        public bool CheckLowStockStatus()
        {
            // Giả sử thực thể Product của bạn có trường 'Stock' hoặc 'Quantity'
            // Bạn có thể inject ProductContext hoặc dùng trực tiếp qua DbContext nếu có DbSet<Product>
            return _context.Set<Entities.Product>().Any(p => p.Stock < 10);
        }


        //ADMIN
        public List<Order> GetAllAdmin(int page, int pageSize, string? searchTerm, string status)
        {
            var query = _context.Orders.AsQueryable();

            if (!string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(o => o.Id.ToString().Contains(searchTerm) || o.ReceiverName.Contains(searchTerm));
            }

            return query
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
        }

        public int CountAllAdmin(string? searchTerm, string status)
        {
            var query = _context.Orders.AsQueryable();

            if (!string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(o => o.Id.ToString().Contains(searchTerm) || o.ReceiverName.Contains(searchTerm));
            }

            return query.Count();
        }

        // DÀNH CHO SHIPPER
        public List<Order> GetOrdersForShipper(int page, int pageSize, string? searchTerm)
        {
            var query = _context.Orders.Where(o => o.Status == "Đang trung chuyển" || o.Status == "Shipper đã nhận" || o.Status == "Đang giao");

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(o => o.Id.ToString().Contains(searchTerm) || o.ReceiverName.Contains(searchTerm));
            }

            return query
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
        }

        public int CountOrdersForShipper(string? searchTerm)
        {
            var query = _context.Orders.Where(o => o.Status == "Đang giao" || o.Status == "Shipper đã nhận" || o.Status == "Đang trung chuyển");

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(o => o.Id.ToString().Contains(searchTerm) || o.ReceiverName.Contains(searchTerm));
            }

            return query.Count();
        }
    }
}