using System.Runtime.InteropServices.Marshalling;
using FootballScore.API.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Infrastructure;

public sealed class TeamStatsService
{
    private readonly AppDbContext _dbContext;
    public TeamStatsService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task RecalculateAsync(int teamId, CancellationToken cancellationToken)
    {
        var team = await _dbContext.Teams.FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);
        if (team is null) return;

        var mathes = await _dbContext.Matches
            .AsNoTracking()
            .Where(m => m.HomeTeamId == teamId || m.AwayTeamId == teamId)
            .ToListAsync(cancellationToken);

        int played = mathes.Count;
        int wins = 0, draws = 0, losses = 0;
        int goalsFor = 0, goalsAgainst = 0, point = 0;

        foreach (var match in matches)
        {
            bool isHome = match.HomeTeamId == teamId;
            int gf = isHome ? match.HomeGoals : match.AwayGoals;
            int ga = isHome ? match.AwayGoals : match.HomeGoals;

            goalsFor += gf;
            goalsAgainst += ga;

            if (gf > ga) { wins++; points += 3; }
            else if (gf == ga) { draws++; points += 1; }
            else { losses++; }
        }

        team.MatchesPlayed = played;
        team.Wins = wins;
        team.Draws = draws;
        team.Losses = losses;
        team.GoalsFor = goalsFor;
        team.GoalsAgainst = goalsAgainst;
        team.Points = points;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}