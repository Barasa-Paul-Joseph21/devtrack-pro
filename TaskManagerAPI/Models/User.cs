using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.Models;

public class User
{
    public int Id { get; set; }
    [Required]
    public string FullName { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    [Required]
    public string Role { get; set; } = "Developer";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Project>? Projects { get; set; }
    public ICollection<TaskItem>? AssignedTasks { get; set; }
}
