using CNPM_TTN.Dtos;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CNPM_TTN.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles = "1")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResponse(users));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return user == null
                ? NotFound(ApiResponse<string>.FailureResponse("Khong tim thay nguoi dung"))
                : Ok(ApiResponse<UserDto>.SuccessResponse(user));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            var result = await _userService.CreateUserAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto)
        {
            var result = await _userService.UpdateUserAsync(id, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _userService.DeleteUserAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}
