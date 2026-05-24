using System;
using System.Collections.Generic;

namespace CNPM_TTN.Dtos
{
    public class FarmingZoneDto
    {
        public string? Name { get; set; }
        public string? Altitude { get; set; }
        public string? Soil { get; set; }
        public string? Climate { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
    }

    public class FarmerDto
    {
        public string? Name { get; set; }
        public string? Scale { get; set; }
        public string? FarmingMethod { get; set; }
        public string? Story { get; set; }
    }

    public class CertificationDto
    {
        public string? Name { get; set; }
        public string? Issuer { get; set; }
        public string? ExpiryDate { get; set; }
        public string? Image { get; set; }
    }

    public class TraceabilityDataDto
    {
        public FarmingZoneDto? FarmingZone { get; set; }
        public FarmerDto? Farmer { get; set; }
        public List<CertificationDto>? Certifications { get; set; }
    }

    public class TraceabilityResultDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public string? Process { get; set; }
        public string? Region { get; set; }
        
        // Thông tin mẻ rang (Roasting Batch)
        public string? BatchCode { get; set; }
        public DateTime? RoastDate { get; set; }
        public string? RoastLevel { get; set; }
        public string? RoasterName { get; set; }

        // Thông tin lô thu hoạch / phiếu nhập
        public string? HarvestBatchCode { get; set; }
        public DateTime? ImportDate { get; set; }
        public string? SupplierName { get; set; }

        // Dữ liệu nguồn gốc chi tiết
        public FarmingZoneDto? FarmingZone { get; set; }
        public FarmerDto? Farmer { get; set; }
        public List<CertificationDto>? Certifications { get; set; }
        
        // Nguồn dữ liệu (ví dụ: "RoastBatch" hoặc "ProductDefault")
        public string DataSource { get; set; } = "ProductDefault";
        public string? WarningMessage { get; set; }
    }
}
