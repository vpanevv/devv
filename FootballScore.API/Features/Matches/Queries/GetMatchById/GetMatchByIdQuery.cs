using FootballScore.API.Features.Matches.Shared;
using MediatR;

namespace Football.API.Features.Matches.Queries.GetMatchById
{
    public class GetMatchByIdQuery : IRequest<MatchDto>
    {
        public int Id { get; }
        public GetMatchByIdQuery(int id)
        {
            Id = id;
        }
    }
}