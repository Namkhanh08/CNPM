using System.Reflection.Metadata;

namespace KHE_AuthService.DTOs
{
    public class AuthReponse
    {
        public string Token { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string Position { get; set; }

        public string Phone { get; set; }
    }
}
