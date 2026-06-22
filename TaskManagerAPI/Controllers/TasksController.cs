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
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Project)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id, t.Title, t.Description, t.Priority, t.Status,
                t.ProjectId, t.AssignedTo, t.CreatedBy, t.DueDate, t.CreatedAt,
                ProjectName = t.Project != null ? t.Project.Name : null,
                AssigneeName = t.Assignee != null ? t.Assignee.FullName : null,
                AssigneeEmail = t.Assignee != null ? t.Assignee.Email : null
            })
            .ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(TaskDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        var projectExists = await _db.Projects.AnyAsync(p => p.Id == dto.ProjectId);
        if (!projectExists) return BadRequest(new { message = "Project not found" });

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = dto.Status,
            ProjectId = dto.ProjectId,
            AssignedTo = dto.AssignedTo,
            DueDate = dto.DueDate,
            CreatedBy = userId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        var created = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Project)
            .FirstAsync(t => t.Id == task.Id);

        return CreatedAtAction(nameof(Get), new { id = task.Id }, new
        {
            created.Id, created.Title, created.Description, created.Priority, created.Status,
            created.ProjectId, created.AssignedTo, created.CreatedBy, created.DueDate, created.CreatedAt,
            ProjectName = created.Project?.Name,
            AssigneeName = created.Assignee?.FullName,
            AssigneeEmail = created.Assignee?.Email
        });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, TaskDto dto)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.Status = dto.Status;
        task.AssignedTo = dto.AssignedTo;
        task.DueDate = dto.DueDate;

        await _db.SaveChangesAsync();

        var updated = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Project)
            .FirstAsync(t => t.Id == id);

        return Ok(new
        {
            updated.Id, updated.Title, updated.Description, updated.Priority, updated.Status,
            updated.ProjectId, updated.AssignedTo, updated.CreatedBy, updated.DueDate, updated.CreatedAt,
            ProjectName = updated.Project?.Name,
            AssigneeName = updated.Assignee?.FullName,
            AssigneeEmail = updated.Assignee?.Email
        });
    }

    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] TaskStatusDto dto)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        task.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(new { task.Id, task.Status });
    }

    [HttpPatch("{id}/priority")]
    [Authorize]
    public async Task<IActionResult> UpdatePriority(int id, [FromBody] TaskPriorityDto dto)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        task.Priority = dto.Priority;
        await _db.SaveChangesAsync();
        return Ok(new { task.Id, task.Priority });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/assign")]
    [Authorize]
    public async Task<IActionResult> Assign(int id, [FromQuery] int userId)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return BadRequest(new { message = "User not found" });

        task.AssignedTo = userId;
        await _db.SaveChangesAsync();
        return Ok(task);
    }
}

public class TaskStatusDto { public string Status { get; set; } = string.Empty; }
public class TaskPriorityDto { public string Priority { get; set; } = string.Empty; }
