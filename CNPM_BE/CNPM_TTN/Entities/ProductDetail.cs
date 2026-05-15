using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class ProductDetail
{
    [Key]
    public int Id { get; set; }

    public int ProductId { get; set; }

  
    public string? Region { get; set; }

    
    public string? Process { get; set; }

  
    public string? Roast { get; set; }

    public string? FlavorNotes { get; set; }


    public virtual Product Product { get; set; } = null!;
}
