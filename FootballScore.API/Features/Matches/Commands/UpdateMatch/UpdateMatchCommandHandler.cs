using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Matches.Commands.UpdateMatch;
using FootballScore.API.Features.Matches.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Matches.Commands.UpdateMatch
{
    public class UpdateMatchCommandHandler : IRequestHandler<UpdateMatchCommand, MatchDto>
    {
        private readonly ApplicationDbContext _dbContext;

        public UpdateMatchCommandHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<MatchDto> Handle(UpdateMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await _dbContext.Matches!
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

            if (match == null)
            {
                throw new KeyNotFoundException($"Match with id {request.Id} not found.");
            }

            // as the description says, we can only update played match details
            match.HomeGoals = request.HomeGoals;
            match.AwayGoals = request.AwayGoals;
            match.MatchDate = request.MatchDate;

            await _dbContext.SaveChangesAsync(cancellationToken);

            // recalculate team statistics after match update
            await RecalculateTeamStats(match.HomeTeamId, cancellationToken);
            await RecalculateTeamStats(match.AwayTeamId, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new MatchDto
            {
                Id = match.Id,
                HomeTeamId = match.HomeTeamId,
                HomeTeamName = match.HomeTeam!.Name!,
                AwayTeamId = match.AwayTeamId,
                AwayTeamName = match.AwayTeam!.Name!,
                HomeGoals = match.HomeGoals,
                AwayGoals = match.AwayGoals,
                MatchDate = match.MatchDate
            };
        }

        // same logic as in CreateMatchCommandHandler for recalculating team stats
        private async Task RecalculateTeamStats(int teamId, CancellationToken cancellationToken)
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