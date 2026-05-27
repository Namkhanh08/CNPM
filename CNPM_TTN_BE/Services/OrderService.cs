using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace CNPM_TTN.Services
{
    public class OrderService
    {
        private readonly OrderRepository _oRepo;
        private readonly ProductRepository _pRepo; // Giả định bạn đã có Repo này
        private readonly CartRepository _cRepo;    // Giả định bạn đã có Repo này

        public OrderService(OrderRepository oRepo, ProductRepository pRepo, CartRepository cRepo)
        {
            _oRepo = oRepo;
            _pRepo = pRepo;
            _cRepo = cRepo;
        }

        public List<Order> GetMyOrders(string userId) => _oRepo.GetByUserId(userId);
        public List<Order> GetAllOrders() => _oRepo.GetAll();

        public Order GetById(int id)
        {
            var order = _oRepo.GetById(id);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng!");
            return order;
        }

        private int ExtractWeightValue(string? weightStr)
        {
            if (string.IsNullOrEmpty(weightStr)) return 0;
            string numberOnly = Regex.Replace(weightStr, @"[^\d]", "");
            if (string.IsNullOrEmpty(numberOnly)) return 0;

            int value = int.Parse(numberOnly);
            if (weightStr.Contains("kg", StringComparison.OrdinalIgnoreCase))
            {
                return value * 1000;
            }
            return value;
        }

        public Order CreateOrder(string userId, CreateOrderDto dto)
        {
            decimal totalAmount = 0;
            var orderDetails = new List<OrderDetail>();

            foreach (var item in dto.Items)
            {
                var product = _pRepo.GetById(item.ProductId);
                if (product == null) throw new Exception("Không tìm thấy sản phẩm!");
                if (product.Stock < item.Quantity) throw new Exception("Số lượng trong kho không đủ để đáp ứng!");

                totalAmount += ((decimal)product.Price * item.Quantity);

                var detail = new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = (decimal)product.Price,
                    FlavorNotes = item.FlavorNotes,
                    GrindingOptionId = item.GrindingOptionId,
                    Weight = item.Weight
                };
                orderDetails.Add(detail);

                // Khấu trừ số lượng gram/gói trong kho
                int weightPerPackage = ExtractWeightValue(item.Weight);
                int totalRemove = weightPerPackage * item.Quantity;
                if (product.Stock < totalRemove) throw new Exception($"Sản phẩm {product.Name} không đủ định lượng đặt hàng");

                product.Stock -= totalRemove;
                _pRepo.Update(product);

                // Xóa vật phẩm khỏi giỏ hàng
                _cRepo.DeleteItem(item.ProductId, item.GrindingOptionId, item.FlavorNotes, item.Weight);
            }

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.Now,
                TotalAmount = totalAmount,
                Status = "VNPAY".Equals(dto.PaymentMethod, StringComparison.OrdinalIgnoreCase) ? "Chờ thanh toán" : "Chờ xử lý",
                ReceiverName = dto.ReceiverName,
                ReceiverPhone = dto.ReceiverPhone,
                ShippingProvince = dto.ShippingProvince,
                ShippingDistrict = dto.ShippingDistrict,
                ShippingWard = dto.ShippingWard,
                ShippingDetailAddress = dto.ShippingDetailAddress,
                ShippingNote = dto.ShippingNote,
                PaymentMethod = dto.PaymentMethod,
                VoucherCode = dto.VoucherCode,
                DiscountAmount = dto.DiscountAmount,
                FinalAmount = dto.FinalAmount,
                OrderDetails = orderDetails
            };

            _oRepo.Create(order);
            return order;
        }

        public Order UpdateStatus(int id, string status)
        {
            var order = _oRepo.GetById(id);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng!");
            order.Status = status;
            _oRepo.Update(order);
            return order;
        }

        public void CancelOrder(int id)
        {
            var order = _oRepo.GetById(id);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng");

            if (order.Status != "Chờ thanh toán" && order.Status != "Chờ xử lý" && order.Status != "Đã thanh toán")
            {
                throw new Exception("Đơn hàng này không thể hủy!");
            }

            var details = _oRepo.GetByOrder(id);
            foreach (var detail in details)
            {
                var product = _pRepo.GetById(detail.ProductId);
                if (product != null)
                {
                    int weightPerPackage = ExtractWeightValue(detail.Weight);
                    int totalReturn = weightPerPackage * detail.Quantity;
                    product.Stock += totalReturn; // Hoàn lại kho
                    _pRepo.Update(product);
                }
            }

            order.Status = "Đã hủy";
            _oRepo.Update(order);
        }

        public Order UpdateOrder(int id, UpdateOrderDto dto)
        {
            var order = _oRepo.GetById(id);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng!");

            if (order.Status != "Chờ xử lý" && order.Status != "Chờ thanh toán" && order.Status != "Đã xác nhận" && order.Status != "Đã thanh toán")
            {
                throw new Exception("Đơn hàng này không thể chỉnh sửa!");
            }

            order.ReceiverName = dto.ReceiverName;
            order.ReceiverPhone = dto.ReceiverPhone;
            order.ShippingProvince = dto.ShippingProvince;
            order.ShippingDistrict = dto.ShippingDistrict;
            order.ShippingWard = dto.ShippingWard;
            order.ShippingDetailAddress = dto.ShippingDetailAddress;
            order.ShippingNote = dto.ShippingNote;
            order.PaymentMethod = dto.PaymentMethod;
            order.Status = "VNPAY".Equals(dto.PaymentMethod, StringComparison.OrdinalIgnoreCase) ? "Chờ thanh toán" : "Chờ xử lý";

            _oRepo.Update(order);
            return order;
        }

        public Order ConfirmOrder(int id)
        {
            var order = _oRepo.GetById(id);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng");
            if (order.Status != "Chờ xử lý") throw new Exception("Chỉ xác nhận đơn ở trạng thái Chờ xử lý");

            order.Status = "Đã xác nhận";
            _oRepo.Update(order);
            return order;
        }

        public PageResponse<Order> GetAllOrdersAdmin(int page, string? searchTerm, string status)
        {
            int pageSize = 10;
            var orders = _oRepo.GetAllAdmin(page, pageSize, searchTerm, status);
            int totalItems = _oRepo.CountAllAdmin(searchTerm, status);
            return new PageResponse<Order>(orders, totalItems, page, pageSize);
        }

        // SHIPPER LOGIC
        public Order ShipperCompleteOrder(int id)
        {
            var order = _oRepo.GetById(id);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng!");
            if (order.Status != "Đang trung chuyển") throw new Exception("Đơn hàng không ở trạng thái chờ giao hàng");

            order.Status = "Hoàn thành";
            _oRepo.Update(order);
            return order;
        }

        public Order ShipperFailOrder(int id)
        {
            var order = _oRepo.GetById(id);
            if (order == null) throw new Exception("Không tìm thấy đơn hàng!");
            if (order.Status != "Đang trung chuyển") throw new Exception("Đơn hàng không ở trạng thái chờ giao hàng");

            var details = _oRepo.GetByOrder(id);
            foreach (var detail in details)
            {
                var product = _pRepo.GetById(detail.ProductId);
                if (product != null)
                {
                    int weightPerPackage = ExtractWeightValue(detail.Weight);
                    int totalReturn = weightPerPackage * detail.Quantity;
                    product.Stock += totalReturn; // Trả lại kho
                    _pRepo.Update(product);
                }
            }

            order.Status = "Đã hủy";
            _oRepo.Update(order);
            return order;
        }

        public PageResponse<Order> GetShipperOrders(int page, string? searchTerm)
        {
            int pageSize = 10;
            var orders = _oRepo.GetOrdersForShipper(page, pageSize, searchTerm);
            int totalItems = _oRepo.CountOrdersForShipper(searchTerm);
            return new PageResponse<Order>(orders, totalItems, page, pageSize);
        }
    }
}