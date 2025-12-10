using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Teams.Shared;
using FootballScore.API.Models;
using MediatR;

namespace FootballScore.API.Features.Teams.Commands.CreateTeam
{
    public class CreateTeamCommandHandler : IRequestHandler<CreateTeamCommand, TeamDto>
    {
        private readonly ApplicationDbContext _dbContext;

        public CreateTeamCommandHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TeamDto> Handle(CreateTeamCommand request, CancellationToken cancellationToken)
        {
            // create new Team entity from the command
            var team = new Team
            {
                Name = request.Name,
                Played = 0,
                Wins = 0,
                Draws = 0,
                Losses = 0,
                GoalsFor = 0,
                GoalsAgainst = 0,
                Points = 0
            };

            // Add the new team in the dbContext
            _dbContext.Teams.Add(team);

            // save the changes to the database
            await _dbContext.SaveChangesAsync(cancellationToken);

            // map the created team entity to TeamDto and return it
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