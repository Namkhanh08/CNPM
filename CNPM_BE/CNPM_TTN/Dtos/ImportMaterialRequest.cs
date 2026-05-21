using System;

namespace CNPM_TTN.Dtos
{
    public class ImportMaterialRequest
    {
        public int RawMaterialId { get; set; }
        public string Supplier { get; set; }
        public double Quantity { get; set; }
        public DateTime ImportDate { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}