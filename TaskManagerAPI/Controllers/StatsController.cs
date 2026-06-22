using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StatsController(AppDbContext db) { _db = db; }

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
        var efficiencyPct = totalTasks > 0 ? (int)Math.Round((double)completedTasks / totalTasks * 100) : 0;

        return Ok(new { totalProjects, projectsThisMonth, activeTasks, urgentTasks, completedTasks, totalTasks, teamMembers, membersThisMonth, efficiencyPct });
    }

    [HttpGet("detailed")]
    public async Task<IActionResult> GetDetailed()
    {
        var now = DateTime.UtcNow;

        // Task breakdown by status
        var tasksByStatus = new
        {
            pending = await _db.Tasks.CountAsync(t => t.Status == "Pending"),
            inProgress = await _db.Tasks.CountAsync(t => t.Status == "In Progress"),
            blocked = await _db.Tasks.CountAsync(t => t.Status == "Blocked"),
            completed = await _db.Tasks.CountAsync(t => t.Status == "Completed"),
        };

        // Task breakdown by priority
        var tasksByPriority = new
        {
            low = await _db.Tasks.CountAsync(t => t.Priority == "Low"),
            medium = await _db.Tasks.CountAsync(t => t.Priority == "Medium"),
            high = await _db.Tasks.CountAsync(t => t.Priority == "High"),
            critical = await _db.Tasks.CountAsync(t => t.Priority == "Critical"),
        };

        // Project breakdown by status
        var projectsByStatus = new
        {
            planning = await _db.Projects.CountAsync(p => p.Status == "Planning"),
            inProgress = await _db.Projects.CountAsync(p => p.Status == "In Progress"),
            onHold = await _db.Projects.CountAsync(p => p.Status == "On Hold"),
            completed = await _db.Projects.CountAsync(p => p.Status == "Completed"),
            archived = await _db.Projects.CountAsync(p => p.Status == "Archived"),
        };

        // Team workload: tasks per user
        var teamWorkload = await _db.Users
            .Select(u => new
            {
                u.Id, u.FullName, u.Role,
                Total = _db.Tasks.Count(t => t.AssignedTo == u.Id),
                Completed = _db.Tasks.Count(t => t.AssignedTo == u.Id && t.Status == "Completed"),
                InProgress = _db.Tasks.Count(t => t.AssignedTo == u.Id && t.Status == "In Progress"),
                Blocked = _db.Tasks.Count(t => t.AssignedTo == u.Id && t.Status == "Blocked"),
            })
            .OrderByDescending(u => u.Total)
            .Take(10)
            .ToListAsync();

        // Recent projects
        var recentProjects = await _db.Projects
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .Select(p => new { p.Id, p.Name, p.Status, p.Progress, p.CreatedAt,
                TaskCount = _db.Tasks.Count(t => t.ProjectId == p.Id),
                CompletedCount = _db.Tasks.Count(t => t.ProjectId == p.Id && t.Status == "Completed") })
            .ToListAsync();

        // Overdue tasks
        var overdueTasks = await _db.Tasks
            .Where(t => t.DueDate != null && t.DueDate < now && t.Status != "Completed")
            .CountAsync();

        // Totals
        var totalTasks = await _db.Tasks.CountAsync();
        var completedTasks = await _db.Tasks.CountAsync(t => t.Status == "Completed");
        var totalProjects = await _db.Projects.CountAsync();
        var totalMembers = await _db.Users.CountAsync();
        var completionRate = totalTasks > 0 ? (int)Math.Round((double)completedTasks / totalTasks * 100) : 0;

        return Ok(new
        {
            tasksByStatus, tasksByPriority, projectsByStatus,
            teamWorkload, recentProjects, overdueTasks,
            totalTasks, completedTasks, totalProjects, totalMembers, completionRate
        });
    }
}
