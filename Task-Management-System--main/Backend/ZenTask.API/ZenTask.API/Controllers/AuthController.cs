using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ZenTask.API.Models;

namespace ZenTask.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ZenTask.API.Data.AppDbContext _context;

        public AuthController(
            UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager, 
            IConfiguration configuration,
            ZenTask.API.Data.AppDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            Serilog.Log.Information("Registration attempt for Username: {Username}, Email: {Email}", model.Username, model.Email);
            
            var userExists = await _userManager.FindByNameAsync(model.Username);
            if (userExists != null)
            {
                Serilog.Log.Warning("Registration failed: Username {Username} already exists", model.Username);
                return BadRequest(new { Status = "Error", Message = "User already exists!" });
            }

            var emailExists = await _userManager.FindByEmailAsync(model.Email);
            if (emailExists != null)
            {
                Serilog.Log.Warning("Registration failed: Email {Email} already in use", model.Email);
                return BadRequest(new { Status = "Error", Message = "Email already in use!" });
            }

            ApplicationUser user = new()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username,
                JoinDate = DateTime.UtcNow
            };
            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                Serilog.Log.Error("User creation failed for {Username}: {Errors}", model.Username, errors);
                return BadRequest(new { Status = "Error", Message = "User creation failed!", Errors = result.Errors.Select(e => e.Description) });
            }

            if (!await _roleManager.RoleExistsAsync("Admin"))
                await _roleManager.CreateAsync(new IdentityRole("Admin"));
            if (!await _roleManager.RoleExistsAsync("Regular User"))
                await _roleManager.CreateAsync(new IdentityRole("Regular User"));

            // Use the role from the model if provided, otherwise default to first-user logic
            if (!string.IsNullOrEmpty(model.Role) && model.Role == "Admin")
            {
                var admins = await _userManager.GetUsersInRoleAsync("Admin");
                if (admins.Count > 0)
                {
                    // If an admin already exists, don't allow another one through registration
                    await _userManager.DeleteAsync(user); // Rollback user creation
                    return BadRequest(new { Status = "Error", Message = "An Admin already exists. Only one Admin is allowed." });
                }
                await _userManager.AddToRoleAsync(user, "Admin");
                Serilog.Log.Information("User {Username} registered as the system Admin.", model.Username);
            }
            else if (!string.IsNullOrEmpty(model.Role) && model.Role == "Regular User")
            {
                await _userManager.AddToRoleAsync(user, "Regular User");
                Serilog.Log.Information("User {Username} registered as Regular User.", model.Username);
            }
            else
            {
                var admins = await _userManager.GetUsersInRoleAsync("Admin");
                if (admins.Count == 0)
                {
                    await _userManager.AddToRoleAsync(user, "Admin");
                    Serilog.Log.Information("User {Username} registered and assigned Admin role (Default First User)", model.Username);
                }
                else
                {
                    await _userManager.AddToRoleAsync(user, "Regular User");
                    Serilog.Log.Information("User {Username} registered successfully with Regular User role", model.Username);
                }
            }

            return Ok(new { Status = "Success", Message = "User created successfully!" });
        }

        [HttpGet("check-admin")]
        public async Task<IActionResult> CheckAdminExists()
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            return Ok(new { exists = admins.Count > 0 });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            Serilog.Log.Information("Login attempt for Username: {Username}", model.Username);
            
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                var userRoles = await _userManager.GetRolesAsync(user);
                Serilog.Log.Information("User {Username} logged in successfully. Roles: {Roles}", model.Username, string.Join(", ", userRoles));

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName!),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                    );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    username = user.UserName,
                    email = user.Email,
                    joinDate = user.JoinDate,
                    roles = userRoles
                });
            }
            
            Serilog.Log.Warning("Failed login attempt for Username: {Username}", model.Username);
            return Unauthorized(new { Message = "Invalid username or password." });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(model.Username) && model.Username != user.UserName)
            {
                var userExists = await _userManager.FindByNameAsync(model.Username);
                if (userExists != null)
                    return BadRequest(new { Message = "Username already taken." });
                
                user.UserName = model.Username;
            }

            if (!string.IsNullOrEmpty(model.Email) && model.Email != user.Email)
            {
                var emailExists = await _userManager.FindByEmailAsync(model.Email);
                if (emailExists != null)
                    return BadRequest(new { Message = "Email already in use by another account." });
                
                user.Email = model.Email;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                Serilog.Log.Warning("UpdateProfile failed for User {UserId}: {Errors}", userId, errors);
                return BadRequest(new { Message = $"Profile update failed: {errors}", Errors = result.Errors.Select(e => e.Description) });
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                username = user.UserName,
                email = user.Email,
                joinDate = user.JoinDate,
                roles = roles
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = _userManager.Users.ToList();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    id = user.Id,
                    username = user.UserName,
                    email = user.Email,
                    joinDate = user.JoinDate,
                    roles = roles
                });
            }

            return Ok(userList);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            // Prevent self-deletion
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            
            if (id == currentUserId)
                return BadRequest(new { Message = "You cannot delete your own administrative account." });

            // Remove associated tasks first to avoid foreign key violations
            var userTasks = _context.Tasks.Where(t => t.UserId == id);
            _context.Tasks.RemoveRange(userTasks);
            await _context.SaveChangesAsync();

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
                return Ok(new { Message = "User deleted successfully." });

            return BadRequest(new { Message = "Failed to delete user." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] string role)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (role != "Admin" && role != "Regular User")
                return BadRequest(new { Message = "Invalid role specified." });

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, role);

            return Ok(new { Message = $"User role updated to {role}." });
        }
    }
}
