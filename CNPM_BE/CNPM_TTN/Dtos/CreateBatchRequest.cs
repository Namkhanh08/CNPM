namespace CNPM_TTN.Dtos
{
    public class CreateBatchRequest
    {
        public int ProductId { get; set; }
        public int InventoryReceiptId { get; set; }
        public string BatchCode { get; set; }
        public string RoastLevel { get; set; }
        public double InputWeight { get; set; }
        public string Status { get; set; }
    }
}