using MediatR;

namespace FootballScore.API.Features.Teams.Commands.DeleteTeam
{
    // command to delete a team by its ID
    public class DeleteTeamCommand : IRequest<Unit>
    {
        public int Id { get; }

        public DeleteTeamCommand(int id)
        {
            Id = id;
        }
    }
}