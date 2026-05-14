using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class Order
{
    [Key]
    public int Id { get; set; }

    [StringLength(450)]
    public string UserId { get; set; } = null!;

    public DateTime OrderDate { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = null!;

    [StringLength(100)]
    public string? ReceiverName { get; set; }

    [StringLength(20)]
    public string? ReceiverPhone { get; set; }

    [StringLength(100)]
    public string? ReceiverEmail { get; set; }

    [StringLength(100)]
    public string? ShippingProvince { get; set; }

    [StringLength(100)]
    public string? ShippingDistrict { get; set; }

    [StringLength(100)]
    public string? ShippingWard { get; set; }

    [StringLength(255)]
    public string? ShippingDetailAddress { get; set; }

    [StringLength(255)]
    public string? ShippingNote { get; set; }

    [StringLength(255)]
    public string? PaymentMethod { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [ForeignKey("UserId")]
    [InverseProperty("Orders")]
    public virtual User User { get; set; } = null!;
}
