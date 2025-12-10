using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Teams.Shared;
using FootballScore.API.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Teams.Queries.GetTeamById
{
    public class GetTeamByIdQueryHandler : IRequestHandler<GetTeamByIdQuery, TeamDto>
    {
        private readonly ApplicationDbContext _dbContext;

        public GetTeamByIdQueryHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TeamDto> Handle(GetTeamByIdQuery request, CancellationToken cancellationToken)
        {
            // get the team by its ID
            var team = await _dbContext.Teams
            .FirstOrDefaultAsync(team => team.Id == request.Id, cancellationToken);

            if (team == null)
            {
                throw new KeyNotFoundException($"Team with ID {request.Id} not found."); // TODO: global exception handler
            }

            return new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
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