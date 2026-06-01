using System;
using System.Collections.Generic;
using System.Linq;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;

namespace CNPM_TTN.Services
{
    public class VoucherService
    {
        private readonly VoucherRepository _voucherRepo;
        private readonly ProductRepository _productRepo; // Bạn cần tạo hoặc đã có ProductRepo tương tự

        public VoucherService(VoucherRepository voucherRepo, ProductRepository productRepo)
        {
            _voucherRepo = voucherRepo;
            _productRepo = productRepo;
        }

        public VoucherAdminResponse GetVouchersAdminPaged(int page, string searchTerm, string status)
        {
            int pageSize = 10;

            var items = _voucherRepo.FindAllAdminPaged(page, pageSize, searchTerm, status);
            int totalItems = _voucherRepo.CountAllAdmin(searchTerm, status);

            var pagedData = new PageResponse<Voucher>(items, totalItems, page, pageSize);

            long active = _voucherRepo.CountActive();
            long freeship = _voucherRepo.CountFreeship();
            long totalUsed = _voucherRepo.CountTotalUsed();

            return new VoucherAdminResponse(pagedData, active, totalUsed, freeship);
        }

        public VoucherDashboardResponse GetVoucherDashboardData()
        {
            var vouchers = _voucherRepo.FindAllManual();
            long active = _voucherRepo.CountActive();
            long freeship = _voucherRepo.CountFreeship();
            long totalUsed = _voucherRepo.CountTotalUsed();

            return new VoucherDashboardResponse(vouchers, active, totalUsed, freeship);
        }

        public List<EligibleVoucherResponse> GetEligibleVouchers(VoucherEligibilityRequest request)
        {
            decimal subtotal = 0;
            foreach (var item in request.Items)
            {
                decimal productPrice = _productRepo.GetProductPrice(item.ProductId);
                subtotal += productPrice * item.Quantity;
            }

            var vouchers = _voucherRepo.FindEligibleVouchers(subtotal, request.PaymentMethod);
            decimal finalSubtotal = subtotal;

            return vouchers.Select(v => {
                var dto = new EligibleVoucherResponse
                {
                    Id = v.Id,
                    Code = v.Code,
                    Title = v.Title,
                    DiscountType = v.DiscountType
                };

                decimal preview = 0;
                if (v.DiscountType == "percent")
                {
                    preview = finalSubtotal * (v.DiscountValue / 100);
                    if (v.MaxDiscount.HasValue && preview > v.MaxDiscount.Value)
                    {
                        preview = v.MaxDiscount.Value;
                    }
                }
                else if (v.DiscountType == "fixed" || v.DiscountType == "shipping")
                {
                    preview = v.DiscountValue;
                }

                dto.DiscountPreview = preview;
                return dto;
            }).ToList();
        }

        public List<EligibleVoucherResponse> GetPublicVouchers()
        {
            var vouchers = _voucherRepo.FindPublicVouchers();
            return vouchers.Select(v => new EligibleVoucherResponse
            {
                Id = v.Id,
                Code = v.Code,
                Title = v.Title,
                DiscountType = v.DiscountType,
                DiscountPreview = v.DiscountValue
            }).ToList();
        }

        public void CreateVoucher(CreateVoucherRequest request)
        {
            var v = new Voucher
            {
                Code = request.Code,
                Title = request.Title,
                DiscountType = request.DiscountType,
                DiscountValue = request.DiscountValue,
                MaxDiscount = request.MaxDiscount,
                MinOrderValue = request.MinOrderValue,
                UsageLimit = request.UsageLimit,
                PaymentMethod = request.PaymentMethod,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsActive = request.IsActive
            };
            _voucherRepo.CreateVoucher(v);
        }

        public void UpdateVoucher(int id, CreateVoucherRequest request)
        {
            var v = new Voucher
            {
                Code = request.Code,
                Title = request.Title,
                DiscountType = request.DiscountType,
                DiscountValue = request.DiscountValue,
                MaxDiscount = request.MaxDiscount,
                MinOrderValue = request.MinOrderValue,
                UsageLimit = request.UsageLimit,
                PaymentMethod = request.PaymentMethod,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsActive = request.IsActive
            };
            _voucherRepo.UpdateVoucher(id, v);
        }

        public void DeleteVoucher(int id)
        {
            _voucherRepo.DeleteVoucher(id);
        }

        public void ToggleVoucher(int id, bool active)
        {
            _voucherRepo.ToggleVoucher(id, active);
        }

        // Thêm vào cuối file VoucherService.cs

        public void ApplyVoucher(string voucherCode)
        {
            if (string.IsNullOrWhiteSpace(voucherCode)) return;

            var voucher = _voucherRepo.GetByCode(voucherCode);
            if (voucher == null) throw new Exception("Voucher không tồn tại!");
            if (!voucher.IsActive) throw new Exception("Voucher này đang bị khóa!");

            var now = DateTime.Now;
            if (voucher.StartDate > now || voucher.EndDate < now) throw new Exception("Voucher đã hết hạn sử dụng!");
            if (voucher.UsedCount >= voucher.UsageLimit) throw new Exception("Voucher này đã hết lượt sử dụng!");

            // Tăng lượt dùng lên 1
            _voucherRepo.UpdateUsedCount(voucher, 1);
        }

        public void ReleaseVoucher(string voucherCode)
        {
            if (string.IsNullOrWhiteSpace(voucherCode)) return;

            var voucher = _voucherRepo.GetByCode(voucherCode);
            if (voucher != null)
            {
                // Giảm lượt dùng đi 1 khi hủy đơn
                _voucherRepo.UpdateUsedCount(voucher, -1);
            }
        }
    }
}