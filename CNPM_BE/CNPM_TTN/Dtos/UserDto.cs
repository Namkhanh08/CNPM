using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Dtos
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string? Contact { get; set; }
        public string? Image { get; set; }
        public bool IsActive { get; set; }
        public int UserType { get; set; }
        public DateTime Created { get; set; }
    }

    public class CreateUserDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string? Contact { get; set; }
        public string? Image { get; set; }

        [Range(0, 3)]
        public int UserType { get; set; }
    }

    public class UpdateUserDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string? Contact { get; set; }
        public string? Image { get; set; }
        public bool IsActive { get; set; } = true;

        [Range(0, 3)]
        public int UserType { get; set; }
    }
}
