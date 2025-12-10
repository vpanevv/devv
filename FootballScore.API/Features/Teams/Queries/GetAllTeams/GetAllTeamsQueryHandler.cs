using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Teams.Queriеs.GetAllTeams;
using FootballScore.API.Features.Teams.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballSocre.API.Features.Teams.Queriеs.GetAllTeams
{
    public class GetAllTeamsQueryHandler : IRequestHandler<GetAllTeamsQuery, IEnumerable<TeamDto>>
    {
        private readonly ApplicationDbContext _dbContext;

        public GetAllTeamsQueryHandler(ApplicationDbContext context)
        {
            _dbContext = context;
        }

        public async Task<IEnumerable<TeamDto>> Handle(GetAllTeamsQuery request, CancellationToken cancellationToken)
        {
            // return the teams ranked by points and goal difference
            var teams = await _dbContext.Teams
            .OrderByDescending(team => team.Points)
            .ThenByDescending(team => team.GoalsFor - team.GoalsAgainst) // goal difference
            .ToListAsync(cancellationToken);

            return teams.Select(team => new TeamDto
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
            });
        }
    }
}