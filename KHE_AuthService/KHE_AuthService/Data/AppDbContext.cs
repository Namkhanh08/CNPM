using Microsoft.EntityFrameworkCore;
using KHE_AuthService.Entities;

namespace KHE_AuthService.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base (options) { }
    }
}
