using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class CartItem
{
    [Key]
    public int Id { get; set; }

    public int CartId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public int? GrindingOptionId { get; set; }

    
    public string? FlavorNotes { get; set; }

 
    public virtual Cart Cart { get; set; } = null!;

  
    public virtual GrindingOption? GrindingOption { get; set; }

  
    public virtual Product Product { get; set; } = null!;
}
