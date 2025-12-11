using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Matches.Shared;
using FootballScore.API.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Features.Teams.Services;
using Microsoft.IdentityModel.Tokens;

namespace FootballScore.API.Features.Matches.Commands.CreateMatch
{
    public class CreateMatchCommandHandler : IRequestHandler<CreateMatchCommand, MatchDto>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ITeamStatisticService _teamStatsService;

        public CreateMatchCommandHandler(ApplicationDbContext dbContext, ITeamStatisticService teamStatsService)
        {
            _dbContext = dbContext;
            _teamStatsService = teamStatsService;
        }

        public async Task<MatchDto> Handle(CreateMatchCommand request, CancellationToken cancellationToken)
        {
            if (request.HomeTeamId == request.AwayTeamId)
            {
                throw new ArgumentException("Home team and away team must be different.");
            }

            // check if two teams exist
            var homeTeam = await _dbContext.Teams
            .FirstOrDefaultAsync(team => team.Id == request.HomeTeamId, cancellationToken);

            var awayTeam = await _dbContext.Teams
            .FirstOrDefaultAsync(team => team.Id == request.AwayTeamId, cancellationToken);

            if (homeTeam == null || awayTeam == null)
            {
                throw new KeyNotFoundException("Home or away team not found.");
            }

            // create new match
            var match = new Match
            {
                HomeTeamId = request.HomeTeamId,
                AwayTeamId = request.AwayTeamId,
                HomeGoals = request.HomeGoals,
                AwayGoals = request.AwayGoals,
                MatchDate = request.MatchDate
            };

            _dbContext.Matches.Add(match);
            await _dbContext.SaveChangesAsync(cancellationToken);

            // recalculate team statistics after match creation
            await _teamStatsService.RecalculateTeamStatisicAsync(homeTeam.Id, cancellationToken);
            await _teamStatsService.RecalculateTeamStatisicAsync(awayTeam.Id, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            // return match dto
            return new MatchDto
            {
                Id = match.Id,
                HomeTeamId = match.HomeTeamId,
                HomeTeamName = homeTeam.Name,
                AwayTeamId = match.AwayTeamId,
                AwayTeamName = awayTeam.Name,
                HomeGoals = match.HomeGoals,
                AwayGoals = match.AwayGoals,
                MatchDate = match.MatchDate
            };
        }
    }
}