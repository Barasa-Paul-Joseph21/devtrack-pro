using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagerAPI.Data;
using TaskManagerAPI.DTOs;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public UsersController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    // Current user profile
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var user = await _db.Users
            .Select(u => new {
                u.Id, u.FullName, u.Email, u.Role, u.CreatedAt,
                TaskCount = _db.Tasks.Count(t => t.AssignedTo == u.Id),
                CompletedTaskCount = _db.Tasks.Count(t => t.AssignedTo == u.Id && t.Status == "Completed"),
                ProjectCount = _db.Projects.Count(p => p.CreatedBy == u.Id)
            })
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound();
        return Ok(user);
    }

    // Current user: change password
    [HttpPut("me/password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!_tokenService.VerifyPassword(user.PasswordHash, dto.CurrentPassword))
            return BadRequest(new { message = "Current password is incorrect" });

        user.PasswordHash = _tokenService.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Password updated successfully" });
    }

    // All authenticated users: list team members
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.FullName)
            .Select(u => new {
                u.Id, u.FullName, u.Email, u.Role, u.CreatedAt,
                TaskCount = _db.Tasks.Count(t => t.AssignedTo == u.Id),
                CompletedTaskCount = _db.Tasks.Count(t => t.AssignedTo == u.Id && t.Status == "Completed"),
                ProjectCount = _db.Projects.Count(p => p.CreatedBy == u.Id)
            })
            .ToListAsync();
        return Ok(users);
    }

    // Get single user profile
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetOne(int id)
    {
        var user = await _db.Users
            .Select(u => new {
                u.Id, u.FullName, u.Email, u.Role, u.CreatedAt,
                TaskCount = _db.Tasks.Count(t => t.AssignedTo == u.Id),
                CompletedTaskCount = _db.Tasks.Count(t => t.AssignedTo == u.Id && t.Status == "Completed"),
                ProjectCount = _db.Projects.Count(p => p.CreatedBy == u.Id),
                RecentTasks = _db.Tasks.Where(t => t.AssignedTo == u.Id)
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(5)
                    .Select(t => new { t.Id, t.Title, t.Status, t.Priority, t.DueDate })
                    .ToList()
            })
            .FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    // Admin: create user
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already registered" });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = _tokenService.HashPassword(dto.Password),
            Role = dto.Role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = user.Id }, new { user.Id, user.FullName, user.Email, user.Role, user.CreatedAt });
    }

    // Admin: update user
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName;
        if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrWhiteSpace(dto.Role)) user.Role = dto.Role;

        await _db.SaveChangesAsync();
        return Ok(new { user.Id, user.FullName, user.Email, user.Role });
    }

    // Admin: update role only
    [HttpPatch("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleUpdateDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.Role = dto.Role;
        await _db.SaveChangesAsync();
        return Ok(new { user.Id, user.Role });
    }

    // Admin: delete user
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        if (id == currentUserId) return BadRequest(new { message = "You cannot delete your own account" });

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}

public class RoleUpdateDto
{
    public string Role { get; set; } = string.Empty;
}
