using KHE_AuthService.DTOs;

namespace KHE_AuthService.Services;

public interface IAuthService
{
    AuthReponse Login(string username, string password);
}
