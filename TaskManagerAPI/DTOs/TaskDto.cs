using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.DTOs;

public class TaskDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "Pending";
    [Required]
    public int ProjectId { get; set; }
    public int? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
}
