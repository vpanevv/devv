namespace PlantlyAI.Models;

public class Workspace
{
    public int Id { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string BusinessLocation { get; set; } = string.Empty;
    public string? LogoPath { get; set; }
    public string? ShortDescription { get; set; }
    public string PostingFrequencyGoal { get; set; } = string.Empty;
    public string AgeRange { get; set; } = string.Empty;
    public string BrandVoiceSummary { get; set; } = string.Empty;
    public string MainGoal { get; set; } = string.Empty;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public ICollection<WorkspaceMember> Members { get; set; } = new List<WorkspaceMember>();
    public ICollection<SocialProfile> SocialProfiles { get; set; } = new List<SocialProfile>();
}
