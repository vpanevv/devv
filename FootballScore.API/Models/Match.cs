using System;

namespace FootballScore.API.Models
{
    public class Match
    {
        public int Id { get; set; }
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }

        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }

        public DateTime DatePlayed { get; set; }

        public Team? HomeTeam { get; set; }
        public Team? AwayTeam { get; set; }
    }
}