using MediatR;

namespace FootballScore.API.Features.Matches.CreateMatch;

public sealed record CreateMatchCommand(int HomeTeamId, int AwayTeamId, int HomeGoals, int AwayGoals, DateTime DatePlayed) : IRequest<int>; // Returns the Id of the created match