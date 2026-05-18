using System.ComponentModel.DataAnnotations;

namespace CNPM_TTN.Dtos
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập hoặc Email không được để trống")]
        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        [StringLength(50, ErrorMessage = "Tên đăng nhập không được vượt quá 50 ký tự")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải chứa ít nhất 6 ký tự")]
        public string Password { get; set; } = string.Empty;

        [Range(0, 3, ErrorMessage = "Loại người dùng không hợp lệ")]
        public int UserType { get; set; } // 0: User, 1: Admin, 2: Staff, 3: StockManager
    }

    public class LoginResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Data { get; set; } // JWT Token
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public int UserType { get; set; }
    }
}
