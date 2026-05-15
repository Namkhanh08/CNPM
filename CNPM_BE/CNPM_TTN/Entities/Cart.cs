using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class Cart
{
    [Key]
    public int Id { get; set; }

   
    public string UserId { get; set; } = null!;

  
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

   
    public virtual User User { get; set; } = null!;
}
