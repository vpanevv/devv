using System.Collections.Generic;
using FootballScore.API.Features.Teams.Shared;
using MediatR;

namespace FootballScore.API.Features.Teams.Queriеs.GetAllTeams
{
    public class GetAllTeamsQuery : IRequest<IEnumerable<TeamDto>>
    {

    }
}