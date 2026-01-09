using MediatR;
using FootballScore.API.Features.Teams.GetAllTeams;


namespace FootballScore.API.Features.Teams.GetTeamById;

public sealed record GetTeamByIdQuery(int Id) : IRequest<TeamDto?>; // return id, null if no such team