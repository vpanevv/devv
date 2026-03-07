using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PlantlyAI.Models;

namespace PlantlyAI.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<SocialProfile> SocialProfiles => Set<SocialProfile>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Workspace>(entity =>
        {
            entity.Property(x => x.BrandName).HasMaxLength(160);
            entity.Property(x => x.Industry).HasMaxLength(100);
            entity.Property(x => x.WebsiteUrl).HasMaxLength(300);
            entity.Property(x => x.BusinessLocation).HasMaxLength(200);
            entity.Property(x => x.LogoPath).HasMaxLength(300);
            entity.Property(x => x.PostingFrequencyGoal).HasMaxLength(100);
            entity.Property(x => x.AgeRange).HasMaxLength(50);
            entity.Property(x => x.BrandVoiceSummary).HasMaxLength(300);
            entity.Property(x => x.MainGoal).HasMaxLength(100);
        });

        builder.Entity<WorkspaceMember>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Role).HasMaxLength(60);

            entity.HasOne(x => x.User)
                .WithMany(x => x.WorkspaceMemberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Workspace)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<SocialProfile>(entity =>
        {
            entity.Property(x => x.Platform).HasMaxLength(60);
            entity.Property(x => x.ProfileUrl).HasMaxLength(300);

            entity.HasOne(x => x.Workspace)
                .WithMany(x => x.SocialProfiles)
                .HasForeignKey(x => x.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
