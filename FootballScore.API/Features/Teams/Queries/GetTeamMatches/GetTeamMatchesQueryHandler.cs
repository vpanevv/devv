using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Features.Teams.Shared.GetTeamMatches;


namespace FootballScore.API.Features.Teams.Queries.GetTeamMatches
{
    public class GetTeamMatchesQueryHandler :
        IRequestHandler<GetTeamMatchesQuery, IEnumerable<TeamMatchDto>>
    {
        private readonly ApplicationDbContext _dbContext;

        public GetTeamMatchesQueryHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<TeamMatchDto>> Handle(GetTeamMatchesQuery request, CancellationToken cancellationToken)
        {
            // check if team exists
            var teamExists = await _dbContext.Teams
                .AnyAsync(team => team.Id == request.TeamId, cancellationToken);

            if (!teamExists)
            {
                throw new KeyNotFoundException($"Team with id {request.TeamId} not found.");
            }

            var matches = await _dbContext.Matches
                .Include(match => match.HomeTeam)
                .Include(match => match.AwayTeam)
                .Where(match => match.HomeTeamId == request.TeamId || match.AwayTeamId == request.TeamId)
                .OrderByDescending(match => match.MatchDate)
                .ToListAsync(cancellationToken);

            return matches.Select(match => new TeamMatchDto
            {
                MatchId = match.Id,
                HomeTeamId = match.HomeTeamId,
                HomeTeamName = match.HomeTeam!.Name!,
                AwayTeamId = match.AwayTeamId,
                AwayTeamName = match.AwayTeam!.Name!,
                HomeGoals = match.HomeGoals,
                AwayGoals = match.AwayGoals,
                DatePlayed = match.MatchDate
            });
        }
    }
}