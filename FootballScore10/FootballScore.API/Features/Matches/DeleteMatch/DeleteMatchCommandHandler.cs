using FootballScore.API.Data;
using FootballScore.API.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Matches.DeleteMatch;

public sealed class DeleteMatchCommandHandler : IRequestHandler<DeleteMatchCommand, Unit>
{
    private readonly AppDbContext _dbContext;
    private readonly TeamStatsService _teamStatsService;

    public DeleteMatchCommandHandler(AppDbContext dbContext, TeamStatsService teamStatsService)
    {
        _dbContext = dbContext;
        _teamStatsService = teamStatsService;
    }

    public async Task<Unit> Handle(DeleteMatchCommand request, CancellationToken cancellationToken)
    {
        var match = await _dbContext.Matches.FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);
        if (match is null)
            throw new KeyNotFoundException($"Match with Id {request.Id} not found.");

        var homeTeamId = match.HomeTeamId;
        var awayTeamId = match.AwayTeamId;

        _dbContext.Matches.Remove(match);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _teamStatsService.RecalculateAsync(homeTeamId, cancellationToken);
        await _teamStatsService.RecalculateAsync(awayTeamId, cancellationToken);

        return Unit.Value;
    }
}