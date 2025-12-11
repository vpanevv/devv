using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Football.API.Features.Matches.Queries.GetMatchById;
using FootballScore.API.Data;
using FootballScore.API.Features.Matches.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Matches.Queries.GetMatchById
{
    public class GetMatchByIdQueryHandler : IRequestHandler<GetMatchByIdQuery, MatchDto>
    {
        private readonly ApplicationDbContext _dbContext;

        public GetMatchByIdQueryHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<MatchDto> Handle(GetMatchByIdQuery request, CancellationToken cancellationToken)
        {
            var match = await _dbContext.Matches
            .Include(x => x.HomeTeam)
            .Include(x => x.AwayTeam)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (match == null)
            {
                throw new KeyNotFoundException($"Match with Id {request.Id} not found.");
            }

            return new MatchDto
            {
                Id = match.Id,
                HomeTeamId = match.HomeTeamId,
                HomeTeamName = match.HomeTeam != null ? match.HomeTeam.Name : string.Empty,
                AwayTeamId = match.AwayTeamId,
                AwayTeamName = match.AwayTeam != null ? match.AwayTeam.Name : string.Empty,
                HomeGoals = match.HomeGoals,
                AwayGoals = match.AwayGoals,
                MatchDate = match.MatchDate
            };
        }
    }
}