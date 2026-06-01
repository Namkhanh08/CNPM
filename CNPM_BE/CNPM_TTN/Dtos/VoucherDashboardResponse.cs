using System.Collections.Generic;
using CNPM_TTN.Entities;

namespace CNPM_TTN.Dtos
{
    public class VoucherDashboardResponse
    {
        public List<Voucher> Voucher { get; set; }
        public long ActiveCount { get; set; }
        public long UsedTodayCount { get; set; }
        public long FreeshipCount { get; set; }

        public VoucherDashboardResponse(List<Voucher> vouchers, long activeCount, long usedTodayCount, long freeshipCount)
        {
            Voucher = vouchers;
            ActiveCount = activeCount;
            UsedTodayCount = usedTodayCount;
            FreeshipCount = freeshipCount;
        }
    }
}