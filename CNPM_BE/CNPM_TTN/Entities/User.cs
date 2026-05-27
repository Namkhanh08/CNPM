using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;


public partial class User
{
    
    public string Id { get; set; } = null!;

 
    public string Name { get; set; } = null!;

    public string UserName { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Salt { get; set; } = null!;

    public string? Contact { get; set; }

   
    public string Email { get; set; } = null!;

   
    public string? Phone { get; set; }

    public string? Position { get; set; }

    public string? Image { get; set; }

    public bool IsActive { get; set; }

    public int UserType { get; set; }

    public DateTime Created { get; set; }
    public int TotalPoints { get; set; } = 0;

    
    public string MemberTier { get; set; } = "Bronze";

    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    public virtual ICollection<RawMaterialLog> RawMaterialLogs { get; set; } = new List<RawMaterialLog>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<RoastingBatch> RoastingBatches { get; set; } = new List<RoastingBatch>();
}
