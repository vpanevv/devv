namespace FootballScore.API.Features.Standings.Shared;

public sealed record StandingDto(
    int Position,
    int TeamId,
    string Name,
    int Played,
    int Wins,
    int Draws,
    int Loses,
    int GoalDifference,
    int Points
);