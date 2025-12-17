namespace FootballScore.API.Entities;

public class Match
{
    public int Id { get; set; }
    public string HomeTeam { get; set; } = null!;
    public string AwayTeam { get; set; } = null!;
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public DateTime PlayedOn { get; set; }
}