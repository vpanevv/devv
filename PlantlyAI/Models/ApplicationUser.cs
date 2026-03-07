using Microsoft.AspNetCore.Identity;

namespace PlantlyAI.Models;

public class ApplicationUser : IdentityUser
{
    public ICollection<WorkspaceMember> WorkspaceMemberships { get; set; } = new List<WorkspaceMember>();
}
