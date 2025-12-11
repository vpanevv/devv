using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Teams.Services
{
    public class TeamStatisticService : ITeamStatisticService
    {
        private readonly ApplicationDbContext _dbContext;

        public TeamStatisticService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        //// this is the logic for calculating the team statistics after a match is created || Points/Wins/Draws/Losses/Goals For/Goals Against
        public async Task RecalculateTeamStatisicAsync(int teamId, CancellationToken cancellationToken)
        {
            var team = await _dbContext.Teams!
                .FirstAsync(t => t.Id == teamId, cancellationToken);

            var matches = await _dbContext.Matches!
                .Where(m => m.HomeTeamId == teamId || m.AwayTeamId == teamId)
                .ToListAsync(cancellationToken);

            int played = 0, wins = 0, draws = 0, losses = 0;
            int goalsFor = 0, goalsAgainst = 0, points = 0;

            foreach (var match in matches)
            {
                played++;

                int teamGoalsFor = match.HomeTeamId == teamId ? match.HomeGoals : match.AwayGoals;
                int teamGoalsAgainst = match.HomeTeamId == teamId ? match.AwayGoals : match.HomeGoals;

                goalsFor += teamGoalsFor;
                goalsAgainst += teamGoalsAgainst;

                if (teamGoalsFor > teamGoalsAgainst)
                {
                    wins++;
                    points += 3;
                }
                else if (teamGoalsFor == teamGoalsAgainst)
                {
                    draws++;
                    points += 1;
                }
                else
                {
                    losses++;
                }
            }

            team.Played = played;
            team.Wins = wins;
            team.Draws = draws;
            team.Losses = losses;
            team.GoalsFor = goalsFor;
            team.GoalsAgainst = goalsAgainst;
            team.Points = points;
        }
    }
}