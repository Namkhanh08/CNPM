using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPM_TTN.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
      
        public string Id { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public int UserType { get; set; }
        public string? Contact { get; set; }
        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string? Image { get; set; }

        public string Salt { get; set; } = "default_salt";
        public bool IsActive { get; set; } = true;
        public DateTime Created { get; set; } = DateTime.Now;
    }
}
