using System.ComponentModel.DataAnnotations;

namespace PlantlyAI.Models;

public class BrandSetupViewModel : IValidatableObject
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

    public List<string> SelectedPlatforms { get; set; } = [];
    public string? InstagramUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? TikTokUrl { get; set; }

    public string PostingFrequencyGoal { get; set; } = string.Empty;

    public string AgeRange { get; set; } = string.Empty;
    public List<string> BrandVoices { get; set; } = [];

    public string MainGoal { get; set; } = string.Empty;
    public IFormFile? LogoFile { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (SelectedPlatforms.Contains("Instagram") && string.IsNullOrWhiteSpace(InstagramUrl))
        {
            yield return new ValidationResult("Instagram link is required when Instagram is selected.", [nameof(InstagramUrl)]);
        }

        if (SelectedPlatforms.Contains("Facebook") && string.IsNullOrWhiteSpace(FacebookUrl))
        {
            yield return new ValidationResult("Facebook link is required when Facebook is selected.", [nameof(FacebookUrl)]);
        }

        if (SelectedPlatforms.Contains("LinkedIn") && string.IsNullOrWhiteSpace(LinkedInUrl))
        {
            yield return new ValidationResult("LinkedIn link is required when LinkedIn is selected.", [nameof(LinkedInUrl)]);
        }

        if (SelectedPlatforms.Contains("TikTok") && string.IsNullOrWhiteSpace(TikTokUrl))
        {
            yield return new ValidationResult("TikTok link is required when TikTok is selected.", [nameof(TikTokUrl)]);
        }
    }
}
