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
using Microsoft.IdentityModel.Tokens;

namespace FootballScore.API.Features.Matches.Commands.CreateMatch
{
    public class CreateMatchCommandHandler : IRequestHandler<CreateMatchCommand, MatchDto>
    {
        private readonly ApplicationDbContext _dbContext;

        public CreateMatchCommandHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
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
            await RecalculateTeamStatistic(homeTeam.Id, cancellationToken);
            await RecalculateTeamStatistic(awayTeam.Id, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

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

        // this is the logic for calculating the team statistics after a match is created || Points/Wins/Draws/Losses/Goals For/Goals Against
        private async Task RecalculateTeamStatistic(int teamId, CancellationToken cancellationToken)
        {
            var team = await _dbContext.Teams
            .FirstAsync(team => team.Id == teamId, cancellationToken);

            var matches = await _dbContext.Matches
            .Where(match => match.HomeTeamId == teamId || match.AwayTeamId == teamId)
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
                    points += 3; //win gives 3 points
                }
                else if (teamGoalsFor == teamGoalsAgainst)
                {
                    draws++;
                    points += 1; //draw gives 1 point
                }
                else
                {
                    losses++; //loss gives 0 points
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