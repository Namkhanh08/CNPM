using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class GrindingOption
{
    
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    [InverseProperty("GrindingOption")]
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    [InverseProperty("GrindingOption")]
    public virtual ICollection<ProductGrindingOption> ProductGrindingOptions { get; set; } = new List<ProductGrindingOption>();
}
