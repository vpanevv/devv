using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Matches.Shared;
using System.Linq;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Football.API.Features.Matches.Queries.GetAllMatches;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Text.RegularExpressions;

namespace FootballScore.API.Feature.matches.Queries.GetAllMatches
{
    public class GetAllMatchesQueryHandler : IRequestHandler<GetAllMatchesQuery, IEnumerable<MatchDto>>
    {
        private readonly ApplicationDbContext _dbContext;

        public GetAllMatchesQueryHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<MatchDto>> Handle(GetAllMatchesQuery request, CancellationToken cancellationToken)
        {
            var matches = await _dbContext.Matches
            .Include(match => match.HomeTeam)
            .Include(match => match.AwayTeam)
            .OrderByDescending(match => match.MatchDate)
            .ToListAsync(cancellationToken);

            return matches.Select(match => new MatchDto
            {
                Id = match.Id,
                HomeTeamId = match.HomeTeamId,
                HomeTeamName = match.HomeTeam != null ? match.HomeTeam.Name : string.Empty,
                AwayTeamId = match.AwayTeamId,
                AwayTeamName = match.AwayTeam != null ? match.AwayTeam.Name : string.Empty,
                HomeGoals = match.HomeGoals,
                AwayGoals = match.AwayGoals,
                MatchDate = match.MatchDate
            });
        }
    }
}