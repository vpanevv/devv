using System;

namespace FootballScore.API.Features.Teams.Shared.GetTeamMatches
{
    public class TeamMatchDto
    {
        public int MatchId { get; set; }

        public int HomeTeamId { get; set; }
        public string HomeTeamName { get; set; } = string.Empty;

        public int AwayTeamId { get; set; }
        public string AwayTeamName { get; set; } = string.Empty;

        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }

        public DateTime DatePlayed { get; set; }
    }
}