namespace FootballScore.API.Features.Teams.GetAllTeams;

public sealed record TeamDto(
    int Id,
    string Name,
    int Played,
    int Wins,
    int Draws,
    int Loses,
    int GoalsFor,
    int GoalsAgainst,
    int Points
);