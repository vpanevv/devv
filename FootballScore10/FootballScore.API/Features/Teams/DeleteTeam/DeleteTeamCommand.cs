using System.Net;
using MediatR;

namespace FootballScore.API.Features.Teams.DeleteTeam;

public sealed record DeleteTeamCommand(int Id) : IRequest<Unit>;

