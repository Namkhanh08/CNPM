namespace KHE_AuthService.Entities
{
    public class User
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public byte[] Salt { get; set; }
        public string Name { get; set; }
        public string Position { get; set; }

        public string Phone { get; set; }
    }
}
