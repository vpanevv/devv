using System;

namespace FootballScore.API.Features.Matches.Shared
{
    // this is what we return to the client
    public class MatchDto
    {
        public int Id { get; set; }
        public int HomeTeamId { get; set; }
        public string HomeTeamName { get; set; } = string.Empty;

        public int AwayTeamId { get; set; }
        public string AwayTeamName { get; set; } = string.Empty;

        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }

        public DateTime MatchDate { get; set; }
    }
}