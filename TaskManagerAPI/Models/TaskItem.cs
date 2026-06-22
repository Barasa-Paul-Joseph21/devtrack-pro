using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.Models;

public class TaskItem
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required]
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    [Required]
    public string Status { get; set; } = "Pending"; // Pending, In Progress, Completed, Blocked

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public int? AssignedTo { get; set; }
    public User? Assignee { get; set; }

    public int CreatedBy { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
