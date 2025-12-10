using System.Collections.Generic;
using FootballScore.API.Features.Matches.Shared;
using MediatR;

namespace Football.API.Features.Matches.Queries.GetAllMatches
{
    public class GetAllMatchesQuery : IRequest<IEnumerable<MatchDto>>
    {

    }
}