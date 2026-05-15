using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

[Index("OrderId", Name = "IX_OrderDetails_OrderId")]
[Index("ProductId", Name = "IX_OrderDetails_ProductId")]
public partial class OrderDetail
{
    [Key]
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }


    public string? FlavorNotes { get; set; }

    public int? GrindingOptionId { get; set; }

   
    public virtual Order Order { get; set; } = null!;

  
    public virtual Product Product { get; set; } = null!;
}
