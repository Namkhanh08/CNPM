using KHE_AuthService.Entities;
namespace KHE_AuthService.Repositories
{
    public interface IUserRepository
    {
        User GetByUsername(string username);
    }
}
