using CNPM_TTN.Data;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

     
        public async Task<User> GetByIdAsync(string id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<bool> UpdateAsync(User user, bool isAdmin = false)
        {
            var existing = await _context.Users.FindAsync(user.Id);
            if (existing == null) return false;          
            existing.Name = user.Name;
            existing.UserName = user.UserName;
            existing.Contact = user.Contact;
            existing.Email = user.Email;
            existing.Phone = user.Phone;
            existing.Image = user.Image;
            // Kiểm tra nếu có mật khẩu mới được gửi lên
            if (!string.IsNullOrEmpty(user.Password))
            {
                // Hash mật khẩu mới trước khi lưu vào DB
                existing.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            }
            if (isAdmin)
            {
                existing.Position = user.Position;
                existing.UserType = user.UserType;
            }
            return await _context.SaveChangesAsync() > 0;
        }


        public async Task<bool> DeleteAsync(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            // Kiểm tra xem người dùng có dữ liệu liên quan không
            bool hasOrders = await _context.Orders.AnyAsync(o => o.UserId == id);
            bool hasCartItems = await _context.Carts.AnyAsync(c => c.UserId == id);

            if (hasOrders || hasCartItems)
            {
                // để Controller báo lỗi: "Không thể xóa người dùng đã có lịch sử giao dịch"
                throw new Exception("Cannot delete user with existing orders or cart items.");
            }

            _context.Users.Remove(user);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> CreateAsync(User user)
        {
            user.Id = Guid.NewGuid().ToString();
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.Salt = Guid.NewGuid().ToString().Substring(0, 8);

          
            user.Created = DateTime.Now;
            user.IsActive = true;
            _context.Users.Add(user);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}