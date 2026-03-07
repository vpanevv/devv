namespace PlantlyAI.Models;

public class SocialProfile
{
    public int Id { get; set; }
    public int WorkspaceId { get; set; }
    public string Platform { get; set; } = string.Empty;
    public string ProfileUrl { get; set; } = string.Empty;

    public Workspace? Workspace { get; set; }
}
