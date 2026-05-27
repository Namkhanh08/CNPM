using CNPM_TTN.Entities;

namespace CNPM_TTN.Dtos
{
    public class VoucherAdminResponse
    {
        public PageResponse<Voucher> PagedData { get; set; }
        public long ActiveCount { get; set; }
        public long UsedCount { get; set; }
        public long FreeshipCount { get; set; }

        public VoucherAdminResponse(PageResponse<Voucher> pagedData, long activeCount, long usedCount, long freeshipCount)
        {
            PagedData = pagedData;
            ActiveCount = activeCount;
            UsedCount = usedCount;
            FreeshipCount = freeshipCount;
        }
    }
}