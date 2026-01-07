using MediatR;

namespace FootballScore.API.Features.Matches.DeleteMatch;

public sealed record DeleteMatchCommand(int Id) : IRequest<Unit>;