using KHE_AuthService.DTOs;
using KHE_AuthService.Helpers;
using KHE_AuthService.Repositories;
using KHE_AuthService.Services;


namespace KHE_AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repo;
        private readonly JwtService _jwt;

        public AuthService(IUserRepository repo, JwtService jwt)
        {
            _jwt = jwt;
            _repo = repo;
        }

        public AuthReponse Login(string username, string password)
        {
            var user = _repo.GetByUsername(username);
            if(user == null)
            {
                return null;
            }
            if (password != user.Password) return null;
            var token = _jwt.GenerateToken(user);

            return new AuthReponse
            {
                Token = token,
                UserId = user.Id,
                Name = user.Name,
                UserName = user.UserName,
                Position = user.Position,
                Phone = user.Phone,
            };
        }
    }
}
