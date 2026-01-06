namespace FootballScore.API.Entities;

public sealed class Match
{
    public int Id { get; set; }
    public int HomeTeamId { get; set; }
    public Team HomeTeam { get; set; } = null!;
    public int AwayTeamId { get; set; }
    public Team AwayTeam { get; set; } = null!;
    public int HomeGoals { get; set; }
    public int AwayGoals { get; set; }
    public DateTime DatePlayed { get; set; }
}