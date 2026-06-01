using System;
using System.Collections.Generic;
using System.Linq;
using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using CNPM_TTN.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Repositories
{
    public class SubscriptionRepository
    {
        private readonly ApplicationDbContext _context;

        public SubscriptionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public Subscription? FindById(int id)
        {
            return _context.Subscriptions.FirstOrDefault(s => s.Id == id);
        }

        public Subscription? FindActiveSubscription(string userId, string frequency, string deliveryDay)
        {
            return _context.Subscriptions.FirstOrDefault(s =>
                s.UserId == userId &&
                s.Frequency == frequency &&
                s.DeliveryDay == deliveryDay &&
                s.Status == "ACTIVE"
            );
        }

        public void CreateSubscription(Subscription subscription)
        {
            _context.Subscriptions.Add(subscription);
            _context.SaveChanges(); // EF tự sinh Id tăng tự động vào object sau dòng này
        }

        public SubscriptionConfig? FindConfigByProductAndSpecs(int subscriptionId, int productId, string? flavorNote, int? grindType, string? weight)
        {
            string? normalizedFlavorNote = string.IsNullOrWhiteSpace(flavorNote) ? null : flavorNote.Trim();
            string? normalizedWeight = string.IsNullOrWhiteSpace(weight) ? null : weight.Trim();

            return _context.SubscriptionConfigs.FirstOrDefault(sc =>
                sc.SubscriptionId == subscriptionId &&
                sc.ProductId == productId &&
                sc.FlavorNote == normalizedFlavorNote &&
                sc.GrindType == grindType &&
                sc.Weight == normalizedWeight
            );
        }

        public void AddSubscriptionConfig(SubscriptionConfig config)
        {
            string? normalizedFlavorNote = string.IsNullOrWhiteSpace(config.FlavorNote) ? null : config.FlavorNote.Trim();
            string? normalizedWeight = string.IsNullOrWhiteSpace(config.Weight) ? null : config.Weight.Trim();

            config.FlavorNote = normalizedFlavorNote;
            config.Weight = normalizedWeight;

            _context.SubscriptionConfigs.Add(config);
            _context.SaveChanges();
        }

        public void UpdateConfigQuantity(int configId, int newQuantity)
        {
            var config = _context.SubscriptionConfigs.Find(configId);
            if (config != null)
            {
                config.Quantity = newQuantity;
                _context.SaveChanges();
            }
        }

        public void CreateSubscriptionOrder(SubscriptionOrder order)
        {
            _context.SubscriptionOrders.Add(order);
            _context.SaveChanges();
        }

        public List<SubscriptionResponseDto> GetUserSubscriptions(string userId)
        {
            // Sử dụng LINQ mạnh mẽ thay vì viết chuỗi SQL thủ công
            var query = from s in _context.Subscriptions
                        join sc in _context.SubscriptionConfigs on s.Id equals sc.SubscriptionId
                        join p in _context.Products on sc.ProductId equals p.Id
                        join so in _context.SubscriptionOrders on s.Id equals so.SubscriptionId into orders
                        from subOrder in orders.DefaultIfEmpty()
                        where s.UserId == userId
                        orderby s.CreatedAt descending
                        select new SubscriptionResponseDto
                        {
                            Id = s.Id,
                            ProductName = p.Name,
                            Frequency = s.Frequency,
                            Status = s.Status,
                            Flavor = sc.FlavorNote,
                            GrindType = sc.GrindType.ToString(),
                            Weight = sc.Weight,
                            Quantity = sc.Quantity,
                            Price = subOrder != null ? subOrder.FinalPrice : 0,
                            NextBilling = s.NextDeliveryDate.ToString("yyyy-MM-dd HH:mm:ss"),
                            DeliveryStep = s.Status == "ACTIVE" ? 2 : (s.Status == "SKIPPED" ? 1 : 0),
                            History = "Subscription created"
                        };

            return query.ToList();
        }

        public void SaveChanges()
        {
            _context.SaveChanges();
        }
    }
}