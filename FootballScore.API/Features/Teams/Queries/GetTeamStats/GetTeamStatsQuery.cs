using FootballScore.API.Features.Teams.Shared;
using MediatR;

namespace FootballScore.API.Features.Teams.Queries.GetTeamStats
{
    // "Дай ми статистиката за този отбор"
    public class GetTeamStatsQuery : IRequest<TeamStatsDto>
    {
        public int TeamId { get; }

        public GetTeamStatsQuery(int teamId)
        {
            TeamId = teamId;
        }
    }
}