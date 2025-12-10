using FootballScore.API.Features.Teams.Shared;
using MediatR;

namespace FootballScore.API.Features.Teams.Queries.GetTeamById
{
    // query to get a team by its ID
    public class GetTeamByIdQuery : IRequest<TeamDto>
    {
        public int Id { get; }

        public GetTeamByIdQuery(int id)
        {
            Id = id;
        }
    }
}