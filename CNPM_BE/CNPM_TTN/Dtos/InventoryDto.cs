using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Dtos
{
    public class UpdateStockDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        public int Quantity { get; set; }

        [StringLength(500)]
        public string Reason { get; set; } = string.Empty;
    }

    public class CreateRoastingBatchDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Required]
        [StringLength(50)]
        public string BatchCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string RoastLevel { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int InputWeight { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty;
    }

    public class InventoryLogDto
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public int OldQuantity { get; set; }
        public int NewQuantity { get; set; }
        public int QuantityChange { get; set; }
        public string ModifiedBy { get; set; } = string.Empty;
        public DateTime ModifiedDate { get; set; }
    }

    public class RoastingBatchDto
    {
        public int Id { get; set; }
        public string BatchCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string RoastLevel { get; set; } = string.Empty;
        public double Weight { get; set; }
        public string RoasterName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
    }
}
