using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("ProductGrindingOptions")] // Tên bảng dưới SQL Server
    public class ProductGrindingOption
    {
        [Column(Order = 0)]
        public int ProductId { get; set; }

        [Column(Order = 1)]
        public int GrindingOptionId { get; set; }


        
        public virtual Product Product { get; set; } = null!;

      
        public virtual GrindingOption GrindingOption { get; set; } = null!;
    }
}