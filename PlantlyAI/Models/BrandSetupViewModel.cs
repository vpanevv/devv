using System.ComponentModel.DataAnnotations;

namespace PlantlyAI.Models;

public class BrandSetupViewModel
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string BrandName { get; set; } = string.Empty;

    public string Industry { get; set; } = string.Empty;

    [Url]
    public string? WebsiteUrl { get; set; }

    public string BusinessLocation { get; set; } = string.Empty;

    public string? ShortDescription { get; set; }

    public string PostingFrequencyGoal { get; set; } = string.Empty;

    public string AgeRange { get; set; } = string.Empty;

    public string MainGoal { get; set; } = string.Empty;
}
