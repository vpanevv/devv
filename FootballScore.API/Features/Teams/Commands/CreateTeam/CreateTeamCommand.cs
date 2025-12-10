using FootballScore.API.Features.Teams.Shared;
using MediatR;

namespace FootballScore.API.Features.Teams.Commands.CreateTeam
{
    public class CreateTeamCommand : IRequest<TeamDto>
    {
        public string Name { get; set; } = string.Empty;
    }
}