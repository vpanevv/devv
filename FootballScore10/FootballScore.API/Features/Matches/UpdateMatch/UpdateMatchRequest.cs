namespace FootballScore.API.Features.Matches.UpdateMatch;

public sealed record UpdateMatchRequest(
    int Id,
    int HomeTeamId,
    int AwayTeamId,
    int HomeGoals,
    int AwayGoals,
    DateTime DatePlayed);