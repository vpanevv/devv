namespace PlantlyAI.Models;

public class WorkspaceMember
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int WorkspaceId { get; set; }
    public string Role { get; set; } = "Owner";

    public ApplicationUser? User { get; set; }
    public Workspace? Workspace { get; set; }
}
