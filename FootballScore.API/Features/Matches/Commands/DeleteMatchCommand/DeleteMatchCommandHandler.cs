using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Features.Teams.Services;

namespace FootballScore.API.Features.Matches.Commands.DeleteMatch
{
    public class DeleteMatchCommandHandler : IRequestHandler<DeleteMatchCommand, Unit>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ITeamStatisticService _teamStatsService;

        public DeleteMatchCommandHandler(ApplicationDbContext dbContext, ITeamStatisticService teamStatsService)
        {
            _dbContext = dbContext;
            _teamStatsService = teamStatsService;
        }

        public async Task<Unit> Handle(DeleteMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await _dbContext.Matches!
                .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

            if (match == null)
            {
                throw new KeyNotFoundException($"Match with id {request.Id} not found.");
            }

            var homeTeamId = match.HomeTeamId;
            var awayTeamId = match.AwayTeamId;

            _dbContext.Matches.Remove(match);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _teamStatsService.RecalculateTeamStatisicAsync(homeTeamId, cancellationToken);
            await _teamStatsService.RecalculateTeamStatisicAsync(awayTeamId, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}