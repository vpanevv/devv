using System.Collections.Generic;
using System.ComponentModel;
using System.Security;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Teams.Shared;
using FootballScore.API.Models;
using MediatR;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Teams.Commands.UpdateTeam
{
    public class UpdateTeamCommandHandler : IRequestHandler<UpdateTeamCommand, TeamDto>
    {
        private readonly ApplicationDbContext _dbContext;

        public UpdateTeamCommandHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TeamDto> Handle(UpdateTeamCommand request, CancellationToken cancellationToken)
        {
            var team = await _dbContext.Teams
            .FirstOrDefaultAsync(team => team.Id == request.Id, cancellationToken);

            if (team == null)
            {
                throw new KeyNotFoundException($"Team with ID {request.Id} not found."); // TODO: global exception handler
            }

            // update the team properties
            team.Name = request.Name;

            await _dbContext.SaveChangesAsync(cancellationToken);

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