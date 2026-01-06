using Microsoft.EntityFrameworkCore;
using FootballScore.API.Entities;

namespace FootballScore.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Match> Matches => Set<Match>();
    public DbSet<Team> Teams => Set<Team>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Match>()
        .HasOne(m => m.HomeTeam)
        .WithMany()
        .HasForeignKey(m => m.HomeTeamId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Match>()
        .HasOne(m => m.AwayTeam)
        .WithMany()
        .HasForeignKey(m => m.AwayTeamId)
        .OnDelete(DeleteBehavior.Restrict);
    }

}