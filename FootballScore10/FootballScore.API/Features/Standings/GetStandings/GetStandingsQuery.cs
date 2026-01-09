using MediatR;
using FootballScore.API.Features.Teams;
using FootballScore.API.Features.Standings.Shared;

namespace FootballScore.API.Features.Standings.GetStandings;

public sealed record GetStandingsQuery() : IRequest<List<StandingDto>>;