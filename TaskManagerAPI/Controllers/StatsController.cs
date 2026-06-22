using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StatsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalProjects = await _db.Projects.CountAsync();
        var projectsThisMonth = await _db.Projects.CountAsync(p => p.CreatedAt >= startOfMonth);

        var totalTasks = await _db.Tasks.CountAsync();
        var completedTasks = await _db.Tasks.CountAsync(t => t.Status == "Completed");
        var activeTasks = totalTasks - completedTasks;
        var urgentTasks = await _db.Tasks.CountAsync(t =>
            t.Status != "Completed" && (t.Priority == "High" || t.Priority == "Critical"));

        var teamMembers = await _db.Users.CountAsync();
        var membersThisMonth = await _db.Users.CountAsync(u => u.CreatedAt >= startOfMonth);

        var efficiencyPct = totalTasks > 0
            ? (int)Math.Round((double)completedTasks / totalTasks * 100)
            : 0;

        return Ok(new
        {
            totalProjects,
            projectsThisMonth,
            activeTasks,
            urgentTasks,
            completedTasks,
            totalTasks,
            teamMembers,
            membersThisMonth,
            efficiencyPct
        });
    }
}
