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

    public virtual DbSet<GrindingOption> GrindingOptions { get; set; }

    public virtual DbSet<InventoryLog> InventoryLogs { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductDetail> ProductDetails { get; set; }

    public virtual DbSet<RoastingBatch> RoastingBatches { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Carts__3214EC0779D0F81D");

            entity.HasOne(d => d.User).WithMany(p => p.Carts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Carts_Users");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CartItem__3214EC071C398D6B");

            entity.Property(e => e.Quantity).HasDefaultValue(1);

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CartItems_Carts");

            entity.HasOne(d => d.GrindingOption).WithMany(p => p.CartItems).HasConstraintName("FK_CartItems_GrindingOptions");

            entity.HasOne(d => d.Product).WithMany(p => p.CartItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CartItems_Products");
        });

        modelBuilder.Entity<InventoryLog>(entity =>
        {
            entity.HasOne(d => d.Product).WithMany(p => p.InventoryLogs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InventoryLogs_Products");

            entity.HasOne(d => d.User).WithMany(p => p.InventoryLogs).HasConstraintName("FK_InventoryLogs_Users");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_Users");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails).OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasOne(d => d.Category).WithMany(p => p.Products).OnDelete(DeleteBehavior.ClientSetNull);

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
            entity.HasKey(e => e.Id).HasName("PK__ProductD__3214EC07BA243111");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProductDetails_Products");
        });

        modelBuilder.Entity<RoastingBatch>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roasting__3214EC071AC1EAA3");

            entity.Property(e => e.RoastDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Product).WithMany(p => p.RoastingBatches)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RoastingBatches_Products");

            entity.HasOne(d => d.User).WithMany(p => p.RoastingBatches).HasConstraintName("FK_RoastingBatches_Users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
