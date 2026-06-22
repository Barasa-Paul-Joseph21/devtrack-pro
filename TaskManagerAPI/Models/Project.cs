using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.Models;

public class Project
{
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? Creator { get; set; }
    public ICollection<TaskItem>? Tasks { get; set; }
}
