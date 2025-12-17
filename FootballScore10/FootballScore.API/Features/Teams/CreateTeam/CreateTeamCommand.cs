using System.Net;
using MediatR;

namespace FootballScore.API.Features.Teams.CreateTeam;

public record CreateTeamCommand(CreateTeamRequest Request) : IRequest<int>;