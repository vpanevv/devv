using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Matches.Commands.DeleteMatch
{
    public class DeleteMatchCommandHandler : IRequestHandler<DeleteMatchCommand, Unit>
    {
        private readonly ApplicationDbContext _dbContext;

        public DeleteMatchCommandHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(DeleteMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await _dbContext.Matches!
                .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

            if (match == null)
            {
                throw new KeyNotFoundException($"Match with id {request.Id} not found.");
            }

            var homeTeamId = match.HomeTeamId;
            var awayTeamId = match.AwayTeamId;

            _dbContext.Matches.Remove(match);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await RecalculateTeamStats(homeTeamId, cancellationToken);
            await RecalculateTeamStats(awayTeamId, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }

        private async Task RecalculateTeamStats(int teamId, CancellationToken cancellationToken)
        {
            var team = await _dbContext.Teams!
                .FirstAsync(t => t.Id == teamId, cancellationToken);

            var matches = await _dbContext.Matches!
                .Where(m => m.HomeTeamId == teamId || m.AwayTeamId == teamId)
                .ToListAsync(cancellationToken);

            int played = 0, wins = 0, draws = 0, losses = 0;
            int goalsFor = 0, goalsAgainst = 0, points = 0;

            foreach (var m in matches)
            {
                played++;

                int teamGoalsFor = m.HomeTeamId == teamId ? m.HomeGoals : m.AwayGoals;
                int teamGoalsAgainst = m.HomeTeamId == teamId ? m.AwayGoals : m.HomeGoals;

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