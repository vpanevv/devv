using MediatR;
using FootballScore.API.Features.Teams;
using FootballScore.API.Features.Teams.GetAllTeams;

namespace FootballScore.API.Features.Teams.CreateTeam;

public sealed record CreateTeamCommand(string Name) : IRequest<TeamDto>;