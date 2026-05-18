using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _repo;
        public UsersController(IUserRepository repo) { _repo = repo; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _repo.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var user = await _repo.GetByIdAsync(id);
            return user != null ? Ok(user) : NotFound();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] User user)
        {
            if (id != user.Id) return BadRequest();
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;      
            bool isAdmin = (userRole == "1");
            if (!isAdmin && id != currentUserId)
            {
                return Forbid();
            }
            var success = await _repo.UpdateAsync(user, isAdmin);

            if (success) return Ok(new { message = "Cập nhật thành công" });
            return StatusCode(500, new { message = "Lỗi khi cập nhật dữ liệu" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var success = await _repo.DeleteAsync(id);
                if (success)
                    return Ok(new { message = "Xóa người dùng thành công." });
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AdminCreateUserRequest request)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (userRole != "1") return Forbid();
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }
            var newUser = new User
            {
                Name = request.Name,
                UserName = request.UserName,
                Password = request.Password, 
                Email = request.Email,
                Phone = request.Phone,
                Position = request.Position,
                Contact = request.Contact,
                Image = request.Image,
                UserType = request.UserType
            };
            var success = await _repo.CreateAsync(newUser);
            if (success)
            {
                return Ok(new { message = "Tạo người dùng thành công" });
            }
            return BadRequest(new { message = "Lỗi khi tạo người dùng hoặc tên đăng nhập đã tồn tại" });
        }
    }
}
