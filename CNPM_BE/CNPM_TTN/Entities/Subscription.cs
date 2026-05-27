using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities;

public class Subscription
{
    [Key]
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public int ProductId { get; set; }

    public int? GrindingOptionId { get; set; }

   
    public string? FlavorNotes { get; set; }

    public string? Weight { get; set; }

    public int Quantity { get; set; } = 1;

    
  
    public string Frequency { get; set; } = "monthly";

    public DateTime StartDate { get; set; }

    public DateTime NextDeliveryDate { get; set; }


    public string? ReceiverName { get; set; }

  
    public string? ReceiverPhone { get; set; }

    public string? ShippingProvince { get; set; }

   
    public string? ShippingDistrict { get; set; }

  
    public string? ShippingWard { get; set; }

  
    public string? ShippingDetailAddress { get; set; }

    public string? PaymentMethod { get; set; }

 
   
    public string Status { get; set; } = "active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}