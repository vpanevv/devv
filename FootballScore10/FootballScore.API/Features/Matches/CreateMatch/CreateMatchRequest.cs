namespace FootballScore.API.Features.Matches.CreateMatch;

public sealed record CreateMatchRequest(
    int HomeTeamId,
    int AwayTeamId,
    int HomeGoals,
    int AwayGoals,
    DateTime DatePlayed
);