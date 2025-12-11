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
using FootballScore.API.Features.Teams.Services;

namespace FootballScore.API.Features.Matches.Commands.UpdateMatch
{
    public class UpdateMatchCommandHandler : IRequestHandler<UpdateMatchCommand, MatchDto>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ITeamStatisticService _teamStatsService;

        public UpdateMatchCommandHandler(ApplicationDbContext dbContext, ITeamStatisticService teamStatsService)
        {
            _dbContext = dbContext;
            _teamStatsService = teamStatsService;
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
            await _teamStatsService.RecalculateTeamStatisicAsync(match.HomeTeamId, cancellationToken);
            await _teamStatsService.RecalculateTeamStatisicAsync(match.AwayTeamId, cancellationToken);
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
    }
}