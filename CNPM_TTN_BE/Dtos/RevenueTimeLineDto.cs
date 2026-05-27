namespace CNPM_TTN.Dtos
{
    public class RevenueTimelineDto
    {
        public string Date { get; set; } = string.Empty; // Định dạng "dd/MM" hiển thị trục X
        public decimal Amount { get; set; }              // Doanh thu ngày đó để vẽ cột Y
    }
}