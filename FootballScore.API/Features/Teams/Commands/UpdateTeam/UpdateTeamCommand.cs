using FootballScore.API.Features.Teams.Shared;
using MediatR;

namespace FootballScore.API.Features.Teams.Commands.UpdateTeam
{
    public class UpdateTeamCommand : IRequest<TeamDto>
    {
        // command: update the team with this data
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}