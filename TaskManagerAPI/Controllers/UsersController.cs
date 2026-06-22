using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
