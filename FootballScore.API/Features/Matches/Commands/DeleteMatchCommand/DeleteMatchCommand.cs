using MediatR;

namespace FootballScore.API.Features.Matches.Commands.DeleteMatch
{
    // command for deleting a played match by id
    public class DeleteMatchCommand : IRequest<Unit>
    {
        public int Id { get; }

        public DeleteMatchCommand(int id)
        {
            Id = id;
        }
    }
}