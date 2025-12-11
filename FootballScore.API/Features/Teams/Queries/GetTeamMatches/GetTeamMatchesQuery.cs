using System.Collections.Generic;
using MediatR;
using FootballScore.API.Features.Teams.Shared.GetTeamMatches;

namespace FootballScore.API.Features.Teams.Queries.GetTeamMatches
{
    public class GetTeamMatchesQuery : IRequest<IEnumerable<TeamMatchDto>>
    {
        public int TeamId { get; }

        public GetTeamMatchesQuery(int teamId)
        {
            TeamId = teamId;
        }
    }
}