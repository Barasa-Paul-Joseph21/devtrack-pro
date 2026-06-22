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

    // Current user: get own profile
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        return Ok(new { user.Id, user.FullName, user.Email, user.Role, user.CreatedAt });
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

    // Admin only: list users
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users.Select(u => new { u.Id, u.FullName, u.Email, u.Role, u.CreatedAt }).ToListAsync();
        return Ok(users);
    }

    // Admin: create user (team member)
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
        return CreatedAtAction(nameof(GetAll), new { id = user.Id }, new { user.Id, user.FullName, user.Email, user.Role });
    }

    // Admin: update role
    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromQuery] string role)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.Role = role;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
