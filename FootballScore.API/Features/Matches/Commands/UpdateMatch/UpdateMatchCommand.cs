using System;
using FootballScore.API.Features.Matches.Shared;
using MediatR;

namespace FootballScore.API.Features.Matches.Commands.UpdateMatch
{

    // command for changing the match details for a played match
    public class UpdateMatchCommand : IRequest<MatchDto>
    {
        public int Id { get; set; }
        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }

        public DateTime MatchDate { get; set; }
    }
}