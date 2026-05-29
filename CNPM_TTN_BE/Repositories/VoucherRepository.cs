using System;
using System.Collections.Generic;
using System.Linq;
using CNPM_TTN.Data;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public class VoucherRepository
    {
        private readonly ApplicationDbContext _context;

        public VoucherRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<Voucher> FindAllManual()
        {
            return _context.Vouchers.ToList();
        }

        public long CountActive()
        {
            return _context.Vouchers.Count(v => v.IsActive);
        }

        public long CountFreeship()
        {
            return _context.Vouchers.Count(v => v.DiscountType == "shipping" && v.IsActive);
        }

        public long CountTotalUsed()
        {
            return _context.Vouchers.Sum(v => v.UsedCount);
        }

        public List<Voucher> FindAllAdminPaged(int page, int pageSize, string searchTerm, string status)
        {
            var query = _context.Vouchers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                string term = searchTerm.Trim().ToLower();
                query = query.Where(v => v.Code.ToLower().Contains(term) || v.Title.ToLower().Contains(term));
            }

            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                bool activeFilter = status.Equals("active", StringComparison.OrdinalIgnoreCase);
                query = query.Where(v => v.IsActive == activeFilter);
            }

            return query.OrderByDescending(v => v.Id)
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .ToList();
        }

        public int CountAllAdmin(string searchTerm, string status)
        {
            var query = _context.Vouchers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                string term = searchTerm.Trim().ToLower();
                query = query.Where(v => v.Code.ToLower().Contains(term) || v.Title.ToLower().Contains(term));
            }

            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                bool activeFilter = status.Equals("active", StringComparison.OrdinalIgnoreCase);
                query = query.Where(v => v.IsActive == activeFilter);
            }

            return query.Count();
        }

        public List<Voucher> FindEligibleVouchers(decimal subtotal, string paymentMethod)
        {
            var now = DateTime.Now;
            return _context.Vouchers
                .Where(v => v.IsActive
                        && v.MinOrderValue <= subtotal
                        && v.UsedCount < v.UsageLimit
                        && v.StartDate <= now
                        && v.EndDate >= now
                        && (string.IsNullOrEmpty(v.PaymentMethod) || v.PaymentMethod == paymentMethod || v.PaymentMethod == "ALL"))
                .ToList();
        }

        public List<Voucher> FindPublicVouchers()
        {
            var now = DateTime.Now;
            return _context.Vouchers
                .Where(v => v.IsActive && v.UsedCount < v.UsageLimit && v.StartDate <= now && v.EndDate >= now)
                .ToList();
        }

        public void CreateVoucher(Voucher voucher)
        {
            _context.Vouchers.Add(voucher);
            _context.SaveChanges();
        }

        public void UpdateVoucher(int id, Voucher updated)
        {
            var existing = _context.Vouchers.Find(id);
            if (existing != null)
            {
                existing.Code = updated.Code;
                existing.Title = updated.Title;
                existing.DiscountType = updated.DiscountType;
                existing.DiscountValue = updated.DiscountValue;
                existing.MaxDiscount = updated.MaxDiscount;
                existing.MinOrderValue = updated.MinOrderValue;
                existing.UsageLimit = updated.UsageLimit;
                existing.PaymentMethod = updated.PaymentMethod;
                existing.StartDate = updated.StartDate;
                existing.EndDate = updated.EndDate;
                existing.IsActive = updated.IsActive;
                _context.SaveChanges();
            }
        }

        public void DeleteVoucher(int id)
        {
            var existing = _context.Vouchers.Find(id);
            if (existing != null)
            {
                _context.Vouchers.Remove(existing);
                _context.SaveChanges();
            }
        }

        public void ToggleVoucher(int id, bool active)
        {
            var existing = _context.Vouchers.Find(id);
            if (existing != null)
            {
                existing.IsActive = active;
                _context.SaveChanges();
            }
        }

        public Voucher? GetByCode(string code)
        {
            return _context.Vouchers.FirstOrDefault(v => v.Code == code);
        }

        public void UpdateUsedCount(Voucher voucher, int amount)
        {
            voucher.UsedCount += amount;
            // Đảm bảo không bị âm UsedCount
            if (voucher.UsedCount < 0) voucher.UsedCount = 0;
        }
    }
}