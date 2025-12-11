using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Teams.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Teams.Queries.GetTeamStats
{
    public class GetTeamStatsQueryHandler
        : IRequestHandler<GetTeamStatsQuery, TeamStatsDto>
    {
        private readonly ApplicationDbContext _dbContext;

        public GetTeamStatsQueryHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TeamStatsDto> Handle(GetTeamStatsQuery request, CancellationToken cancellationToken)
        {
            var team = await _dbContext.Teams
                .FirstOrDefaultAsync(team => team.Id == request.TeamId, cancellationToken);

            if (team == null)
            {
                throw new KeyNotFoundException($"Team with id {request.TeamId} not found.");
            }

            return new TeamStatsDto
            {
                TeamId = team.Id,
                TeamName = team.Name!,
                Played = team.Played,
                Wins = team.Wins,
                Draws = team.Draws,
                Losses = team.Losses,
                GoalsFor = team.GoalsFor,
                GoalsAgainst = team.GoalsAgainst,
                Points = team.Points
            };
        }
    }
}