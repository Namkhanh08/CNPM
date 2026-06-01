using CNPM_TTN.Entities; 
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Cart> Carts { get; set; }

        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<GrindingOption> GrindingOptions { get; set; }

        public DbSet<Order> Orders { get; set; }

        public DbSet<OrderDetail> OrderDetails { get; set; }

        public DbSet<Product> Products { get; set; }
        public DbSet<ProductGrindingOption> ProductGrindingOptions { get; set; }
        public DbSet<ProductDetail> ProductDetails { get; set; }
        public DbSet<RawMaterialLog> RawMaterialLogs { get; set; }
        public DbSet<RoastingBatch> RoastingBatches { get; set; }
        public virtual DbSet<RawMaterial> RawMaterials { get; set; }
        public virtual DbSet<InventoryReceipt> InventoryReceipts { get; set; }

        public DbSet<Voucher> Vouchers { get; set; }
        public virtual DbSet<LoyaltyPoint> LoyaltyPoints { get; set; }


        public DbSet<Subscription> Subscriptions { get; set; }

        public DbSet<SubscriptionConfig> SubscriptionConfigs { get; set; }
        public DbSet<SubscriptionOrder> SubscriptionOrders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Chỉ định rõ tên bảng trung gian dưới SQL và tạo khóa chính tổ hợp (Composite Key)
            modelBuilder.Entity<ProductGrindingOption>()
                .ToTable("ProductGrindingOptions")
                .HasKey(pg => new { pg.ProductId, pg.GrindingOptionId });

            // 2. Cấu hình mối quan hệ 1-Nhiều từ Product -> ProductGrindingOption
            modelBuilder.Entity<ProductGrindingOption>()
                .HasOne(pg => pg.Product)
                .WithMany(p => p.ProductGrindingOptions)
                .HasForeignKey(pg => pg.ProductId);

            // 3. Cấu hình mối quan hệ 1-Nhiều từ GrindingOption -> ProductGrindingOption
            modelBuilder.Entity<ProductGrindingOption>()
                .HasOne(pg => pg.GrindingOption)
                .WithMany(g => g.ProductGrindingOptions) // Đảm bảo bên Entity GrindingOption.cs có thuộc tính này, nếu không có thì để trống .WithMany()
                .HasForeignKey(pg => pg.GrindingOptionId);


        }
    }
}