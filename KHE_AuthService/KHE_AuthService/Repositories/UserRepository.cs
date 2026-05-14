using KHE_AuthService.Data;
using KHE_AuthService.Entities;
using KHE_AuthService.Repositories;


namespace KHE_AuthService.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public User GetByUsername(string username)
        {
            return _context.Users
                .FirstOrDefault(x => x.UserName == username);
        }
    }
}
