using System;
using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Entities;

public class LoyaltyPoint
{
    public int Id { get; set; }

  
    public string UserId { get; set; } = null!;

    public int Points { get; set; }

   
    public string Type { get; set; } = "earn";

    public string Description { get; set; } = string.Empty;

    public int? OrderId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
}