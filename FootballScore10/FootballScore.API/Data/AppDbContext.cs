using Microsoft.EntityFrameworkCore;
using FootballScore.API.Entities;

namespace FootballScore.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Match> Matches => Set<Match>();
}