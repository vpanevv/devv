using MediatR;

namespace FootballScore.API.Features.Teams.GetAllTeams;

public sealed record GetAllTeamsQuery() : IRequest<List<TeamDto>>;