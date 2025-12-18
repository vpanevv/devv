namespace FootballScore.API.Features.Teams.CreateTeam;

public class CreateTeamRequest
{
    public string Name { get; set; } = string.Empty;
    public int Played { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Loses { get; set; }
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
}