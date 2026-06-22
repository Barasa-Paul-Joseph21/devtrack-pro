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
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProjectsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _db.Projects.Include(p => p.Tasks).ToListAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var project = await _db.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == id);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(ProjectDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            CreatedBy = userId
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, ProjectDto dto)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();

        project.Name = dto.Name;
        project.Description = dto.Description;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
