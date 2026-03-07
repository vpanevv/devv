using System.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PlantlyAI.Data;
using PlantlyAI.Models;

namespace PlantlyAI.Controllers;

public class HomeController : Controller
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IWebHostEnvironment _environment;

    public HomeController(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IWebHostEnvironment environment)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _environment = environment;
    }

    public IActionResult Index()
    {
        return View(new BrandSetupViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateWorkspace(BrandSetupViewModel model)
    {
        if (!ModelState.IsValid)
        {
            ViewData["OpenBrandDialog"] = true;
            return View("Index", model);
        }

        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                EmailConfirmed = true
            };

            var createUserResult = await _userManager.CreateAsync(user);

            if (!createUserResult.Succeeded)
            {
                foreach (var error in createUserResult.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }

                ViewData["OpenBrandDialog"] = true;
                return View("Index", model);
            }
        }

        var workspace = new Workspace
        {
            BrandName = model.BrandName,
            Industry = model.Industry,
            WebsiteUrl = model.WebsiteUrl,
            BusinessLocation = model.BusinessLocation,
            ShortDescription = model.ShortDescription,
            PostingFrequencyGoal = model.PostingFrequencyGoal,
            AgeRange = model.AgeRange,
            BrandVoiceSummary = string.Join(", ", model.BrandVoices),
            MainGoal = model.MainGoal,
            LogoPath = await SaveLogoAsync(model.LogoFile)
        };

        AddSocialProfileIfPresent(workspace, "Instagram", model.SelectedPlatforms, model.InstagramUrl);
        AddSocialProfileIfPresent(workspace, "Facebook", model.SelectedPlatforms, model.FacebookUrl);
        AddSocialProfileIfPresent(workspace, "LinkedIn", model.SelectedPlatforms, model.LinkedInUrl);
        AddSocialProfileIfPresent(workspace, "TikTok", model.SelectedPlatforms, model.TikTokUrl);

        workspace.Members.Add(new WorkspaceMember
        {
            UserId = user.Id,
            Role = "Owner"
        });

        _dbContext.Workspaces.Add(workspace);
        await _dbContext.SaveChangesAsync();

        TempData["StatusMessage"] = "The workspace is created";
        TempData["OpenSuccessDialog"] = true;
        return RedirectToAction(nameof(Index));
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    private async Task<string?> SaveLogoAsync(IFormFile? logoFile)
    {
        if (logoFile is null || logoFile.Length == 0)
        {
            return null;
        }

        var uploadsRoot = Path.Combine(_environment.WebRootPath, "uploads", "logos");
        Directory.CreateDirectory(uploadsRoot);

        var safeFileName = $"{Guid.NewGuid():N}{Path.GetExtension(logoFile.FileName)}";
        var fullPath = Path.Combine(uploadsRoot, safeFileName);

        await using var stream = System.IO.File.Create(fullPath);
        await logoFile.CopyToAsync(stream);

        return $"/uploads/logos/{safeFileName}";
    }

    private static void AddSocialProfileIfPresent(
        Workspace workspace,
        string platform,
        ICollection<string> selectedPlatforms,
        string? profileUrl)
    {
        if (!selectedPlatforms.Contains(platform) || string.IsNullOrWhiteSpace(profileUrl))
        {
            return;
        }

        workspace.SocialProfiles.Add(new SocialProfile
        {
            Platform = platform,
            ProfileUrl = profileUrl
        });
    }
}
