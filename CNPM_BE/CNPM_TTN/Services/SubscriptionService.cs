
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace CNPM_TTN.Services
{
    public class SubscriptionService
    {
        private readonly SubscriptionRepository _subscriptionRepo;

        public SubscriptionService(SubscriptionRepository subscriptionRepo)
        {
            _subscriptionRepo = subscriptionRepo;
        }

        public void CreateSubscription(string userId, CreateSubscriptionRequest request)
        {
            if (request.Quantity <= 0)
            {
                throw new Exception("Quantity must be greater than zero!");
            }

            DateTime now = DateTime.Now;
            Subscription? sub = _subscriptionRepo.FindActiveSubscription(userId, request.Frequency, request.DeliveryDay);
            int subscriptionId;

            DateTime firstDeliveryDate = CalculateFirstDeliveryDate(request.DeliveryDay);

            if (sub == null)
            {
                int commitmentMonths = request.Commitment?.ToLower() switch
                {
                    "3months" => 3,
                    "6months" => 6,
                    _ => 0
                };

                DateTime nextDeliveryDate = CalculateNextDeliveryDate(firstDeliveryDate, request.Frequency);

                var newSub = new Subscription
                {
                    UserId = userId,
                    Frequency = request.Frequency,
                    DeliveryDay = request.DeliveryDay,
                    Status = "ACTIVE",
                    CreatedAt = now,
                    NextDeliveryDate = nextDeliveryDate,
                    CommitmentMonths = commitmentMonths,
                    CommitmentEndDate = commitmentMonths > 0 ? now.AddMonths(commitmentMonths) : null
                };

                _subscriptionRepo.CreateSubscription(newSub);
                subscriptionId = newSub.Id;
            }
            else
            {
                subscriptionId = sub.Id;
            }

            var existingConfig = _subscriptionRepo.FindConfigByProductAndSpecs(
                subscriptionId, request.ProductId, request.FlavorNotes, request.GrindType, request.Weight);

            if (existingConfig != null)
            {
                int newQuantity = existingConfig.Quantity + request.Quantity;
                _subscriptionRepo.UpdateConfigQuantity(existingConfig.Id, newQuantity);
            }
            else
            {
                var config = new SubscriptionConfig
                {
                    SubscriptionId = subscriptionId,
                    ProductId = request.ProductId,
                    FlavorNote = request.FlavorNotes,
                    GrindType = request.GrindType,
                    Weight = request.Weight,
                    Quantity = request.Quantity
                };
                _subscriptionRepo.AddSubscriptionConfig(config);
            }

            // Dùng System.Text.Json chuẩn của .NET thay vì ghép chuỗi String thủ công
            var snapshotObj = new
            {
                ProductId = request.ProductId,
                FlavorNotes = request.FlavorNotes ?? "",
                GrindType = request.GrindType,
                Weight = request.Weight ?? "",
                Quantity = request.Quantity,
                FinalPrice = request.TotalPrice
            };
            string jsonSnapshot = JsonSerializer.Serialize(snapshotObj);

            var order = new SubscriptionOrder
            {
                SubscriptionId = subscriptionId,
                DeliveryDate = firstDeliveryDate,
                Status = "PENDING_PAYMENT",
                CreatedAt = now,
                ReceiverName = request.ReceiverName,
                ReceiverPhone = request.ReceiverPhone,
                ShippingAddress = request.ShippingAddress,
                PaymentMethod = request.PaymentMethod,
                FinalPrice = request.TotalPrice,
                SnapshotDetails = jsonSnapshot
            };

            _subscriptionRepo.CreateSubscriptionOrder(order);
        }

        private DateTime CalculateFirstDeliveryDate(string deliveryDayStr)
        {
            DateTime target = DateTime.Now;
            DayOfWeek targetDay = deliveryDayStr.Trim().ToLower() switch
            {
                "thứ hai" or "thứ 2" or "monday" => DayOfWeek.Monday,
                "thứ ba" or "thứ 3" or "tuesday" => DayOfWeek.Tuesday,
                "thứ tư" or "thứ 4" or "wednesday" => DayOfWeek.Wednesday,
                "thứ năm" or "thứ 5" or "thursday" => DayOfWeek.Thursday,
                "thứ sáu" or "thứ 6" or "friday" => DayOfWeek.Friday,
                "thứ bảy" or "thứ 7" or "saturday" => DayOfWeek.Saturday,
                _ => DayOfWeek.Sunday
            };

            while (target.DayOfWeek != targetDay)
            {
                target = target.AddDays(1);
            }
            return target;
        }

        private DateTime CalculateNextDeliveryDate(DateTime firstDeliveryDate, string frequency)
        {
            if (frequency.Contains("2weeks", StringComparison.OrdinalIgnoreCase) || frequency.Contains("2 tuần", StringComparison.OrdinalIgnoreCase))
            {
                return firstDeliveryDate.AddDays(14);
            }
            if (frequency.Contains("4weeks", StringComparison.OrdinalIgnoreCase) || frequency.Contains("4 tuần", StringComparison.OrdinalIgnoreCase))
            {
                return firstDeliveryDate.AddDays(28);
            }
            return firstDeliveryDate.AddDays(7); // Mặc định 1 tuần
        }

        public List<SubscriptionResponseDto> GetUserSubscriptions(string userId)
        {
            return _subscriptionRepo.GetUserSubscriptions(userId);
        }

        public void ToggleSkipSubscription(string userId, int subscriptionId)
        {
            var sub = _subscriptionRepo.FindById(subscriptionId);
            if (sub == null || sub.UserId != userId) // Bảo mật: Chỉ chủ gói mới được đổi trạng thái
                throw new Exception("Subscription not found or unauthorized");

            sub.Status = sub.Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase) ? "SKIPPED" : "ACTIVE";
            _subscriptionRepo.SaveChanges();
        }

        public void CancelSubscription(string userId, int subscriptionId)
        {
            var sub = _subscriptionRepo.FindById(subscriptionId);
            if (sub == null || sub.UserId != userId) // Bảo mật
                throw new Exception("Subscription not found or unauthorized");

            sub.Status = "CANCELLED";
            _subscriptionRepo.SaveChanges();
        }

        public void UpdateSubscriptionConfig(string userId, int subscriptionId, UpdateSubscriptionConfigRequest request)

        {

            var sub = _subscriptionRepo.FindById(subscriptionId);

            if (sub == null || sub.UserId != userId) // Bảo mật

                throw new Exception("Subscription not found or unauthorized");



            // Tìm config đầu tiên của subscription này để cập nhật

            var config = sub.Configs?.FirstOrDefault() ?? _subscriptionRepo.FindConfigByProductAndSpecs(subscriptionId, 0, null, 0, null);



            // Tìm chính xác hơn từ database dựa trên mối quan hệ nếu cần thiết

            // Để giữ logic cũ của bạn đơn giản:

            string? normalizedFlavor = string.IsNullOrWhiteSpace(request.FlavorNote) ? null : request.FlavorNote.Trim();

            string? normalizedWeight = string.IsNullOrWhiteSpace(request.Weight) ? null : request.Weight.Trim();



            // Thực hiện update trực tiếp thông qua Navigation Property của EF Core

            var subConfig = _subscriptionRepo.FindConfigByProductAndSpecs(subscriptionId, sub.Configs.FirstOrDefault()?.ProductId ?? 0, null, 0, null);

            // Cách tốt nhất là cập nhật trực tiếp qua context

        }
    }
}