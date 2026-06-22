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
        var tasks = await _db.Tasks.Include(t => t.Assignee).Include(t => t.Project).ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var task = await _db.Tasks.Include(t => t.Assignee).Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(TaskDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
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
        return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
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
        return NoContent();
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
