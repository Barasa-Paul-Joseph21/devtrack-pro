using System.ComponentModel.DataAnnotations;

namespace TaskManagerAPI.DTOs;

public class ProjectDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
