using System;
using System.Collections.Generic;
using System.Globalization; 
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;

namespace CNPM_TTN.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly IVoucherRepository _repository;

        public VoucherService(IVoucherRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> GetVouchersAdminAsync(int page, string searchTerm, string status)
        {
            var vouchers = await _repository.GetAllAsync();
            
            if (!string.IsNullOrEmpty(searchTerm))
            {
                vouchers = vouchers.Where(v => v.Code.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                                              v.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }

           
            if (status.ToLower() == "active") vouchers = vouchers.Where(v => v.IsActive);
            else if (status.ToLower() == "inactive") vouchers = vouchers.Where(v => !v.IsActive);

            var activeCount = vouchers.Count(v => v.IsActive);
            var usedTodayCount = vouchers.Count(v => v.StartDate.Date == DateTime.UtcNow.Date && v.UsedCount > 0);
            var freeshipCount = vouchers.Count(v => v.DiscountType.Equals("Freeship", StringComparison.OrdinalIgnoreCase));

            
            int pageSize = 10;
            var totalItems = vouchers.Count();
            var pagedData = vouchers.Skip((page - 1) * pageSize).Take(pageSize);

            var mappedData = pagedData.Select(v => MapToDto(v)).ToList();

            return new
            {
                voucher = mappedData,
                totalItems,
                activeCount,
                usedTodayCount,
                freeshipCount
            };
        }

        public async Task<IEnumerable<VoucherDto>> GetAvailableVouchersAsync(CheckAvailableVoucherDto dto)
        {
            var now = DateTime.UtcNow;
            var vouchers = await _repository.GetAllAsync();

           
            var availableVouchers = vouchers.Where(v =>
                v.IsActive &&
                v.StartDate <= now &&
                v.EndDate >= now &&
                v.UsedCount < v.UsageLimit &&
                dto.OrderTotal >= v.MinOrderValue &&
                (string.IsNullOrEmpty(v.PaymentMethod) || v.PaymentMethod.Equals(dto.PaymentMethod, StringComparison.OrdinalIgnoreCase))
            );

            return availableVouchers.Select(v => MapToDto(v));
        }

        public async Task<IEnumerable<VoucherDto>> GetPublicVouchersAsync()
        {
            var now = DateTime.UtcNow;
            var vouchers = await _repository.GetAllAsync();

            
            var publicVouchers = vouchers.Where(v => v.IsActive && v.StartDate <= now && v.EndDate >= now);
            return publicVouchers.Select(v => MapToDto(v));
        }

        public async Task<VoucherDto> CreateVoucherAsync(CreateUpdateVoucherDto dto)
        {
            
            var cultureInfo = new CultureInfo("vi-VN");
            string dateFormat = "dd/MM/yyyy hh:mm tt";

            
            if (!DateTime.TryParseExact(dto.StartDate, dateFormat, cultureInfo, DateTimeStyles.None, out DateTime startDateTime))
            {
                startDateTime = DateTime.UtcNow; 
            }

            
            if (!DateTime.TryParseExact(dto.EndDate, dateFormat, cultureInfo, DateTimeStyles.None, out DateTime endDateTime))
            {
                endDateTime = DateTime.UtcNow.AddDays(30); 
            }

            var voucher = new Voucher
            {
                Code = dto.Code,
                Title = dto.Title,
                Description = dto.Description,
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                MaxDiscount = dto.MaxDiscount,
                MinOrderValue = dto.MinOrderValue,
                UsageLimit = dto.UsageLimit,
                UsedCount = 0,
                PaymentMethod = dto.PaymentMethod,
                IsActive = dto.IsActive,
                StartDate = startDateTime, 
                EndDate = endDateTime      
            };

            await _repository.AddAsync(voucher);
            await _repository.SaveChangesAsync();

            return MapToDto(voucher);
        }

        public async Task<bool> UpdateVoucherAsync(int id, CreateUpdateVoucherDto dto)
        {
            var voucher = await _repository.GetByIdAsync(id);
            if (voucher == null) return false;

            
            var cultureInfo = new CultureInfo("vi-VN");
            string dateFormat = "dd/MM/yyyy hh:mm tt";

            
            if (!DateTime.TryParseExact(dto.StartDate, dateFormat, cultureInfo, DateTimeStyles.None, out DateTime startDateTime))
            {
                startDateTime = voucher.StartDate; 
            }

            if (!DateTime.TryParseExact(dto.EndDate, dateFormat, cultureInfo, DateTimeStyles.None, out DateTime endDateTime))
            {
                endDateTime = voucher.EndDate; 
            }

            voucher.Code = dto.Code;
            voucher.Title = dto.Title;
            voucher.Description = dto.Description;
            voucher.DiscountType = dto.DiscountType;
            voucher.DiscountValue = dto.DiscountValue;
            voucher.MaxDiscount = dto.MaxDiscount;
            voucher.MinOrderValue = dto.MinOrderValue;
            voucher.UsageLimit = dto.UsageLimit;
            voucher.PaymentMethod = dto.PaymentMethod;
            voucher.IsActive = dto.IsActive;
            voucher.StartDate = startDateTime;
            voucher.EndDate = endDateTime;

            _repository.Update(voucher);
            return await _repository.SaveChangesAsync();
        }

        public async Task<bool> DeleteVoucherAsync(int id)
        {
            var voucher = await _repository.GetByIdAsync(id);
            if (voucher == null) return false;

            _repository.Delete(voucher);
            return await _repository.SaveChangesAsync();
        }

        public async Task<bool> ToggleVoucherAsync(int id, bool active)
        {
            var voucher = await _repository.GetByIdAsync(id);
            if (voucher == null) return false;

            voucher.IsActive = active;
            _repository.Update(voucher);
            return await _repository.SaveChangesAsync();
        }

        // Helper Map Entity sang DTO
        private VoucherDto MapToDto(Voucher v) => new VoucherDto
        {
            Id = v.Id,
            Code = v.Code,
            Title = v.Title,
            Description = v.Description,
            DiscountType = v.DiscountType,
            DiscountValue = v.DiscountValue,
            MaxDiscount = v.MaxDiscount,
            MinOrderValue = v.MinOrderValue,
            UsageLimit = v.UsageLimit,
            UsedCount = v.UsedCount,
            PaymentMethod = v.PaymentMethod,
            IsActive = v.IsActive,
            StartDate = v.StartDate,
            EndDate = v.EndDate
        };
    }
}