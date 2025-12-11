using System.Collections.Generic;
using MediatR;

namespace FootballScore.API.Features.Standings
{
    public class GetStandingsQuery : IRequest<IEnumerable<StandingDto>>
    {

    }
}
