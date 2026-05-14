using System.Security.Cryptography;
using System.Text;

namespace KHE_AuthService.Helpers
{
    public class PasswordHelper
    {
        public static string Hash(string password, byte[] salt)
        {
            using var sha = SHA256.Create();
            var saltBytes = salt ?? Array.Empty<byte>();
            var combined = Encoding.UTF8.GetBytes(password)
                .Concat(saltBytes)
                .ToArray();

            var hash = sha.ComputeHash(combined);
            return Convert.ToBase64String(hash);
        }
    }
}
