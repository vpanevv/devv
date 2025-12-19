using MediatR;
using FootballScore.API.Features.Teams;
using FootballScore.API.Features.Teams.GetAllTeams;

namespace FootballScore.API.Features.Teams.UpdateTeam;

public sealed record UpdateTeamCommand(int Id, string Name) : IRequest<TeamDto>;