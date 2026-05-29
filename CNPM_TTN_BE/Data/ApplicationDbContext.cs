using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace CNPM_TTN.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<GrindingOption> GrindingOptions { get; set; }

        public DbSet<Product> Products { get; set; }

        public DbSet<ProductDetail> ProductDetails { get; set; }

        public DbSet<Cart> Carts { get; set; }

        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Voucher> Vouchers { get; set; }

        public DbSet<Order> Orders { get; set; }

        public DbSet<OrderDetail> OrderDetails { get; set; }

        public DbSet<Subscription> Subscriptions { get; set; }

        public DbSet<SubscriptionConfig> SubscriptionConfigs { get; set; }
        public DbSet<SubscriptionOrder> SubscriptionOrders { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình mối quan hệ nhiều-nhiều qua bảng trung gian cụ thể trong DB của bạn
            modelBuilder.Entity<ProductDetail>()
                .HasMany(pd => pd.GrindingOptions)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "ProductGrindingOptions", // Tên bảng trung gian chính xác trong SQL Server
                    j => j.HasOne<GrindingOption>().WithMany().HasForeignKey("GrindingOptionId"),
                    j => j.HasOne<ProductDetail>().WithMany().HasForeignKey("ProductId") // Hoặc ProductDetailId tùy theo khóa ngoại bạn đặt
                );
        }
    }
}