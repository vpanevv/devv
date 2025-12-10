using System;
using FootballScore.API.Features.Matches.Shared;
using FootballScore.API.Features.Teams.Shared;
using MediatR;

namespace FootballScore.API.Features.Matches.Commands.CreateMatch
{
    // creating a match which is played with necessary goals and date 
    public class CreateMatchCommand : IRequest<MatchDto>
    {
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }

        public DateTime MatchDate { get; set; }
    }
}