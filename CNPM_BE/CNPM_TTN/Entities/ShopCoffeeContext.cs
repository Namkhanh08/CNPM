using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Entities;

public partial class ShopCoffeeContext : DbContext
{
    public ShopCoffeeContext()
    {
    }

    public ShopCoffeeContext(DbContextOptions<ShopCoffeeContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Certification> Certifications { get; set; }

    public virtual DbSet<Farmer> Farmers { get; set; }

    public virtual DbSet<FarmerCertification> FarmerCertifications { get; set; }

    public virtual DbSet<FarmingZone> FarmingZones { get; set; }

    public virtual DbSet<GrindingOption> GrindingOptions { get; set; }

    public virtual DbSet<HarvestBatch> HarvestBatches { get; set; }

    public virtual DbSet<InventoryLog> InventoryLogs { get; set; }

    public virtual DbSet<InventoryReceipt> InventoryReceipts { get; set; }

    public virtual DbSet<LoyaltyPoint> LoyaltyPoints { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductDetail> ProductDetails { get; set; }

    public virtual DbSet<ProductVariant> ProductVariants { get; set; }

    public virtual DbSet<RawMaterial> RawMaterials { get; set; }

    public virtual DbSet<RawMaterialLog> RawMaterialLogs { get; set; }

    public virtual DbSet<RoastingBatch> RoastingBatches { get; set; }

    public virtual DbSet<Subscription> Subscriptions { get; set; }

    public virtual DbSet<SubscriptionConfig> SubscriptionConfigs { get; set; }

    public virtual DbSet<SubscriptionOrder> SubscriptionOrders { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAddress> UserAddresses { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=CẢNHHIỆP273;Database=Dataset;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Carts__3214EC0729294429");

            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.User).WithMany(p => p.Carts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Carts_Users");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CartItem__3214EC073FDAD60C");

            entity.HasIndex(e => e.CartId, "IX_CartItems_CartId");

            entity.Property(e => e.FlavorNotes).HasMaxLength(100);
            entity.Property(e => e.Quantity).HasDefaultValue(1);
            entity.Property(e => e.Weight).HasMaxLength(100);

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CartItems_Carts");

            entity.HasOne(d => d.GrindingOption).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.GrindingOptionId)
                .HasConstraintName("FK_CartItems_GrindingOptions");

            entity.HasOne(d => d.Product).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CartItems_Products");

            entity.HasOne(d => d.ProductVariant).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ProductVariantId)
                .HasConstraintName("FK__CartItems__Produ__339FAB6E");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Certification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Certific__3214EC0769BA00A6");

            entity.Property(e => e.Issuer).HasMaxLength(200);
            entity.Property(e => e.LogoUrl).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(200);
        });

        modelBuilder.Entity<Farmer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Farmers__3214EC0741117776");

            entity.Property(e => e.FarmingMethod).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Scale).HasMaxLength(100);

            entity.HasOne(d => d.FarmingZone).WithMany(p => p.Farmers)
                .HasForeignKey(d => d.FarmingZoneId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Farmers__Farming__3D2915A8");
        });

        modelBuilder.Entity<FarmerCertification>(entity =>
        {
            entity.HasKey(e => new { e.FarmerId, e.CertificationId }).HasName("PK__FarmerCe__C238F6D017DBAD49");

            entity.Property(e => e.DocumentUrl).HasMaxLength(500);

            entity.HasOne(d => d.Certification).WithMany(p => p.FarmerCertifications)
                .HasForeignKey(d => d.CertificationId)
                .HasConstraintName("FK__FarmerCer__Certi__42E1EEFE");

            entity.HasOne(d => d.Farmer).WithMany(p => p.FarmerCertifications)
                .HasForeignKey(d => d.FarmerId)
                .HasConstraintName("FK__FarmerCer__Farme__41EDCAC5");
        });

        modelBuilder.Entity<FarmingZone>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FarmingZ__3214EC07FA99CF09");

            entity.Property(e => e.Altitude).HasMaxLength(100);
            entity.Property(e => e.Climate).HasMaxLength(255);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Province).HasMaxLength(100);
            entity.Property(e => e.SoilType).HasMaxLength(200);
        });

        modelBuilder.Entity<GrindingOption>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<HarvestBatch>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__HarvestB__3214EC07BFCBDEB5");

            entity.HasIndex(e => e.BatchCode, "UQ__HarvestB__B22ADA8E5C80BC6E").IsUnique();

            entity.Property(e => e.BatchCode).HasMaxLength(100);
            entity.Property(e => e.ProcessingMethod).HasMaxLength(100);
            entity.Property(e => e.QualityScore).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.Farmer).WithMany(p => p.HarvestBatches)
                .HasForeignKey(d => d.FarmerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HarvestBa__Farme__46B27FE2");

            entity.HasOne(d => d.RawMaterial).WithMany(p => p.HarvestBatches)
                .HasForeignKey(d => d.RawMaterialId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HarvestBa__RawMa__47A6A41B");
        });

        modelBuilder.Entity<InventoryLog>(entity =>
        {
            entity.Property(e => e.ModifiedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.Product).WithMany(p => p.InventoryLogs)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InventoryLogs_Products");

            entity.HasOne(d => d.User).WithMany(p => p.InventoryLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_InventoryLogs_Users");
        });

        modelBuilder.Entity<InventoryReceipt>(entity =>
        {
            entity.Property(e => e.CreatedBy).HasMaxLength(450);
            entity.Property(e => e.ExpiryDate).HasColumnType("datetime");
            entity.Property(e => e.ImportDate).HasColumnType("datetime");
            entity.Property(e => e.Supplier).HasMaxLength(250);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.InventoryReceipts)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_InventoryReceipts_Users");

            entity.HasOne(d => d.HarvestBatch).WithMany(p => p.InventoryReceipts)
                .HasForeignKey(d => d.HarvestBatchId)
                .HasConstraintName("FK__Inventory__Harve__489AC854");

            entity.HasOne(d => d.RawMaterial).WithMany(p => p.InventoryReceipts)
                .HasForeignKey(d => d.RawMaterialId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InventoryReceipts_RawMaterials");
        });

        modelBuilder.Entity<LoyaltyPoint>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_LoyaltyPoints_UserId");

            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Type).HasMaxLength(20);

            entity.HasOne(d => d.User).WithMany(p => p.LoyaltyPoints)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_LoyaltyPoints_Users");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_Orders_UserId");

            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.FinalAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PaymentMethod).HasMaxLength(255);
            entity.Property(e => e.ReceiverEmail).HasMaxLength(100);
            entity.Property(e => e.ReceiverName).HasMaxLength(100);
            entity.Property(e => e.ReceiverPhone).HasMaxLength(20);
            entity.Property(e => e.ShippingDetailAddress).HasMaxLength(255);
            entity.Property(e => e.ShippingDistrict).HasMaxLength(100);
            entity.Property(e => e.ShippingNote).HasMaxLength(255);
            entity.Property(e => e.ShippingProvince).HasMaxLength(100);
            entity.Property(e => e.ShippingWard).HasMaxLength(100);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.VoucherCode).HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_Users");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasIndex(e => e.OrderId, "IX_OrderDetails_OrderId");

            entity.HasIndex(e => e.ProductId, "IX_OrderDetails_ProductId");

            entity.Property(e => e.FlavorNotes).HasMaxLength(250);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Weight).HasMaxLength(250);

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails).HasForeignKey(d => d.OrderId);

            entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.ProductVariant).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.ProductVariantId)
                .HasConstraintName("FK__OrderDeta__Produ__3493CFA7");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(e => e.CategoryId, "IX_Products_CategoryId");

            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasMany(d => d.GrindingOptions).WithMany(p => p.Products)
                .UsingEntity<Dictionary<string, object>>(
                    "ProductGrindingOption",
                    r => r.HasOne<GrindingOption>().WithMany()
                        .HasForeignKey("GrindingOptionId")
                        .HasConstraintName("FK_ProductGrindingOptions_GrindingOptions"),
                    l => l.HasOne<Product>().WithMany()
                        .HasForeignKey("ProductId")
                        .HasConstraintName("FK_ProductGrindingOptions_Products"),
                    j =>
                    {
                        j.HasKey("ProductId", "GrindingOptionId");
                        j.ToTable("ProductGrindingOptions");
                    });
        });

        modelBuilder.Entity<ProductDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ProductD__3214EC07E5557A5E");

            entity.Property(e => e.BestTime).HasMaxLength(50);
            entity.Property(e => e.MatchTags).HasMaxLength(500);
            entity.Property(e => e.Process).HasMaxLength(255);
            entity.Property(e => e.Region).HasMaxLength(255);
            entity.Property(e => e.Roast).HasMaxLength(100);

            entity.HasOne(d => d.FarmingZone).WithMany(p => p.ProductDetails)
                .HasForeignKey(d => d.FarmingZoneId)
                .HasConstraintName("FK__ProductDe__Farmi__498EEC8D");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductDetails)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProductDetails_Products");
        });

        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ProductV__3214EC07263252F1");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Sku)
                .HasMaxLength(50)
                .HasColumnName("SKU");
            entity.Property(e => e.Weight).HasMaxLength(50);

            entity.HasOne(d => d.Product).WithMany(p => p.ProductVariants)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__ProductVa__Produ__30C33EC3");
        });

        modelBuilder.Entity<RawMaterial>(entity =>
        {
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Unit)
                .HasMaxLength(20)
                .HasDefaultValue("kg");

            entity.HasOne(d => d.Category).WithMany(p => p.RawMaterials)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RawMaterials_Categories");
        });

        modelBuilder.Entity<RawMaterialLog>(entity =>
        {
            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.ModifiedBy).HasMaxLength(450);
            entity.Property(e => e.ModifiedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Reason).HasMaxLength(500);

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.RawMaterialLogs)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK_RawMaterialLogs_Users");

            entity.HasOne(d => d.RawMaterial).WithMany(p => p.RawMaterialLogs)
                .HasForeignKey(d => d.RawMaterialId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RawMaterialLogs_RawMaterials");

            entity.HasOne(d => d.Receipt).WithMany(p => p.RawMaterialLogs)
                .HasForeignKey(d => d.ReceiptId)
                .HasConstraintName("FK_RawMaterialLogs_Receipts");
        });

        modelBuilder.Entity<RoastingBatch>(entity =>
        {
            entity.Property(e => e.BatchCode).HasMaxLength(50);
            entity.Property(e => e.RoastDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RoastLevel).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.InventoryReceipt).WithMany(p => p.RoastingBatches)
                .HasForeignKey(d => d.InventoryReceiptId)
                .HasConstraintName("FK_RoastingBatches_InventoryReceipts");

            entity.HasOne(d => d.Product).WithMany(p => p.RoastingBatches)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RoastingBatches_Products");

            entity.HasOne(d => d.User).WithMany(p => p.RoastingBatches)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_RoastingBatches_Users");
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasIndex(e => e.ProductId, "IX_Subscriptions_ProductId");

            entity.HasIndex(e => e.UserId, "IX_Subscriptions_UserId");

            entity.Property(e => e.CommitmentEndDate).HasColumnType("datetime");
            entity.Property(e => e.CommitmentMonths).HasDefaultValue(1);
            entity.Property(e => e.DeliveryDay).HasMaxLength(20);
            entity.Property(e => e.FlavorNotes).HasMaxLength(200);
            entity.Property(e => e.Frequency).HasMaxLength(20);
            entity.Property(e => e.PaymentMethod).HasMaxLength(100);
            entity.Property(e => e.ReceiverName).HasMaxLength(100);
            entity.Property(e => e.ReceiverPhone).HasMaxLength(20);
            entity.Property(e => e.ShippingDetailAddress).HasMaxLength(255);
            entity.Property(e => e.ShippingDistrict).HasMaxLength(100);
            entity.Property(e => e.ShippingProvince).HasMaxLength(100);
            entity.Property(e => e.ShippingWard).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Weight).HasMaxLength(50);

            entity.HasOne(d => d.Product).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_Subscriptions_Products");

            entity.HasOne(d => d.User).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Subscriptions_Users");
        });

        modelBuilder.Entity<SubscriptionConfig>(entity =>
        {
            entity.HasIndex(e => e.SubscriptionId, "IX_SubscriptionConfigs_SubscriptionId");

            entity.Property(e => e.FlavorNote).HasMaxLength(100);
            entity.Property(e => e.Weight).HasMaxLength(20);

            entity.HasOne(d => d.GrindTypeNavigation).WithMany(p => p.SubscriptionConfigs)
                .HasForeignKey(d => d.GrindType)
                .HasConstraintName("FK_SubscriptionConfigs_GrindingOptions");

            entity.HasOne(d => d.Product).WithMany(p => p.SubscriptionConfigs)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SubscriptionConfigs_Products");

            entity.HasOne(d => d.Subscription).WithMany(p => p.SubscriptionConfigs)
                .HasForeignKey(d => d.SubscriptionId)
                .HasConstraintName("FK_SubscriptionConfigs_Subscriptions");
        });

        modelBuilder.Entity<SubscriptionOrder>(entity =>
        {
            entity.HasIndex(e => e.SubscriptionId, "IX_SubscriptionOrders_SubscriptionId");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DeliveryDate).HasColumnType("datetime");
            entity.Property(e => e.FinalPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PaymentMethod).HasMaxLength(30);
            entity.Property(e => e.ReceiverName).HasMaxLength(150);
            entity.Property(e => e.ReceiverPhone).HasMaxLength(20);
            entity.Property(e => e.ShippingAddress).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(30);

            entity.HasOne(d => d.Subscription).WithMany(p => p.SubscriptionOrders)
                .HasForeignKey(d => d.SubscriptionId)
                .HasConstraintName("FK_SubscriptionOrders_Subscriptions");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.UserName, "IX_Users_UserName").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.MemberTier)
                .HasMaxLength(20)
                .HasDefaultValue("Bronze");
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.UserName).HasMaxLength(50);
        });

        modelBuilder.Entity<UserAddress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserAddr__3214EC07C41E6E9D");

            entity.Property(e => e.DetailAddress).HasMaxLength(255);
            entity.Property(e => e.District).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Province).HasMaxLength(100);
            entity.Property(e => e.ReceiverName).HasMaxLength(150);
            entity.Property(e => e.UserId).HasMaxLength(450);
            entity.Property(e => e.Ward).HasMaxLength(100);

            entity.HasOne(d => d.User).WithMany(p => p.UserAddresses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__UserAddre__UserI__37703C52");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasIndex(e => e.Code, "IX_Vouchers_Code").IsUnique();

            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.DiscountType).HasMaxLength(20);
            entity.Property(e => e.DiscountValue).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MaxDiscount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MinOrderValue).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.PaymentMethod).HasMaxLength(20);
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasMany(d => d.Categories).WithMany(p => p.Vouchers)
                .UsingEntity<Dictionary<string, object>>(
                    "VoucherCategory",
                    r => r.HasOne<Category>().WithMany()
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("FK_VoucherCategories_Categories"),
                    l => l.HasOne<Voucher>().WithMany()
                        .HasForeignKey("VoucherId")
                        .HasConstraintName("FK_VoucherCategories_Vouchers"),
                    j =>
                    {
                        j.HasKey("VoucherId", "CategoryId");
                        j.ToTable("VoucherCategories");
                    });

            entity.HasMany(d => d.Products).WithMany(p => p.Vouchers)
                .UsingEntity<Dictionary<string, object>>(
                    "VoucherProduct",
                    r => r.HasOne<Product>().WithMany()
                        .HasForeignKey("ProductId")
                        .HasConstraintName("FK_VoucherProducts_Products"),
                    l => l.HasOne<Voucher>().WithMany()
                        .HasForeignKey("VoucherId")
                        .HasConstraintName("FK_VoucherProducts_Vouchers"),
                    j =>
                    {
                        j.HasKey("VoucherId", "ProductId");
                        j.ToTable("VoucherProducts");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
