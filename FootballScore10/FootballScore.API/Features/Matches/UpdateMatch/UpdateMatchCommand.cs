using System.Net;
using MediatR;

namespace FootballScore.API.Features.Matches.UpdateMatch;

public sealed record UpdateMatchCommand(
    int Id,
    int HomeTeamId,
    int AwayTeamId,
    int HomeGoals,
    int AwayGoals,
    DateTime DatePlayed) : IRequest<Unit>;
