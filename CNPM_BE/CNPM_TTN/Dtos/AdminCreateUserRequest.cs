namespace CNPM_TTN.Dtos
{
    public class AdminCreateUserRequest
    {
        public string Name { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int UserType { get; set; }
        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string? Contact { get; set; }
        public string? Image { get; set; }
    }
}
