using System.Security.Cryptography.X509Certificates;
using Microsoft.EntityFrameworkCore;
using MovieApp.Web.Models;

namespace MovieApp.Web.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<Title> Titles => Set<Title>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Titles>()
            .Property(t => t.Name)
            .HasMaxLength(200)
            .IsRequired();

            modelBuilder.Entity<Review>()
            .Property(r => r.Stars)
            .IsRequired();

            modelBuilder.Entity<Review>()
            .HasOne(r => r.Title)
            .WithMany(t => t.Reviews)
            .HasForeignKey(r => r.TitleId)
            .OnDelete(DeleteBehavior.Cascade);
        }
    }
}