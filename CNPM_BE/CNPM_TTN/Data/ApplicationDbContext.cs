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

        public DbSet<ProductDetail> ProductDetails { get; set; }
        public DbSet<InventoryLog> inventoryLogs { get; set; }
        public DbSet<RoastingBatch> roastingBatches { get; set; }
    }
}