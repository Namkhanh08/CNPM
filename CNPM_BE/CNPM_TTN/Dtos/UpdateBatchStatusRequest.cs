namespace CNPM_TTN.Dtos
{
    public class UpdateBatchStatusRequest
    {
        public string Status { get; set; }
        public double? OutputWeight { get; set; }
    }
}