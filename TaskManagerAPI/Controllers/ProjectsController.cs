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
        var projects = await _db.Projects
            .Include(p => p.Tasks)
            .Include(p => p.Creator)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id, p.Name, p.Description, p.Status, p.Progress, p.CreatedBy, p.CreatedAt,
                CreatorName = p.Creator != null ? p.Creator.FullName : null,
                TotalTasks = p.Tasks != null ? p.Tasks.Count : 0,
                CompletedTasks = p.Tasks != null ? p.Tasks.Count(t => t.Status == "Completed") : 0,
                Tasks = p.Tasks != null ? p.Tasks.Select(t => new { t.Id, t.Title, t.Status, t.Priority }) : null
            })
            .ToListAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var project = await _db.Projects
            .Include(p => p.Tasks)
            .Include(p => p.Creator)
            .FirstOrDefaultAsync(p => p.Id == id);
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
            Status = dto.Status,
            Progress = dto.Progress,
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
        project.Status = dto.Status;
        project.Progress = dto.Progress;
        await _db.SaveChangesAsync();
        return Ok(project);
    }

    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        project.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(new { project.Id, project.Status });
    }

    [HttpPatch("{id}/progress")]
    [Authorize]
    public async Task<IActionResult> UpdateProgress(int id, [FromBody] ProgressUpdateDto dto)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        project.Progress = Math.Clamp(dto.Progress, 0, 100);
        await _db.SaveChangesAsync();
        return Ok(new { project.Id, project.Progress });
    }

    [HttpPost("{id}/duplicate")]
    [Authorize]
    public async Task<IActionResult> Duplicate(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var original = await _db.Projects.FindAsync(id);
        if (original == null) return NotFound();

        var copy = new Project
        {
            Name = original.Name + " (Copy)",
            Description = original.Description,
            Status = "Planning",
            Progress = 0,
            CreatedBy = userId
        };
        _db.Projects.Add(copy);
        await _db.SaveChangesAsync();
        return Ok(copy);
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

public class StatusUpdateDto { public string Status { get; set; } = string.Empty; }
public class ProgressUpdateDto { public int Progress { get; set; } }
