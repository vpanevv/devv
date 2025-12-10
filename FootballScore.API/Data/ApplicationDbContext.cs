using Microsoft.EntityFrameworkCore;
using FootballScore.API.Models;

namespace FootballScore.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Team> Teams { get; set; } = null!;
        public DbSet<Match> Matches { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Team
            modelBuilder.Entity<Team>(entity =>
            {
                entity.Property(t => t.Name)
                      .IsRequired()
                      .HasMaxLength(100);
            });

            // Match – две FK към Team
            modelBuilder.Entity<Match>(entity =>
            {
                entity.HasOne(m => m.HomeTeam)
                      .WithMany()
                      .HasForeignKey(m => m.HomeTeamId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.AwayTeam)
                      .WithMany()
                      .HasForeignKey(m => m.AwayTeamId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}