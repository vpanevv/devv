using FootballScore.API.Data;
using FootballScore.API.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Matches.UpdateMatch;

public sealed class UpdateMatchCommandHandler : IRequestHandler<UpdateMatchCommand, Unit>
{
    private readonly AppDbContext _dbContext;
    private readonly TeamStatsService _teamStatsService;

    public UpdateMatchCommandHandler(AppDbContext dbContext, TeamStatsService teamStatsService)
    {
        _dbContext = dbContext;
        _teamStatsService = teamStatsService;
    }

    public async Task<Unit> Handle(UpdateMatchCommand request, CancellationToken cancellationToken)
    {
        if (request.DatePlayed > DateTime.UtcNow)
            throw new ArgumentException("Only played matches are allowed (DatePlayed cannot be in the future).");

        if (request.HomeTeamId == request.AwayTeamId)
            throw new ArgumentException("HomeTeamId and AwayTeamId must be different.");

        if (request.HomeGoals < 0 || request.AwayGoals < 0)
            throw new ArgumentException("Goals cannot be negative.");

        var match = await _dbContext.Matches.FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);
        if (match is null)
            throw new KeyNotFoundException($"Match with Id {request.Id} not found.");

        //remember the old teams if changed
        var oldHomeId = match.HomeTeamId;
        var oldAwayId = match.AwayTeamId;

        //valitedate teams exist
        var homeExists = await _dbContext.Teams.AnyAsync(t => t.Id == request.HomeTeamId, cancellationToken);
        var awayExists = await _dbContext.Teams.AnyAsync(t => t.Id == request.AwayTeamId, cancellationToken);
        if (!homeExists || !awayExists)
            throw new KeyNotFoundException("One or both of the specified teams do not exist.");

        match.HomeTeamId = request.HomeTeamId;
        match.AwayTeamId = request.AwayTeamId;
        match.HomeGoals = request.HomeGoals;
        match.AwayGoals = request.AwayGoals;
        match.DatePlayed = request.DatePlayed;

        await _dbContext.SaveChangesAsync(cancellationToken);

        //recalculate stats for old and new teams if changed
        await _teamStatsService.RecalculateAsync(oldHomeId, cancellationToken);
        await _teamStatsService.RecalculateAsync(oldAwayId, cancellationToken);

        if (request.HomeTeamId != oldHomeId)
            await _teamStatsService.RecalculateAsync(request.HomeTeamId, cancellationToken);
        if (request.AwayTeamId != oldAwayId)
            await _teamStatsService.RecalculateAsync(request.AwayTeamId, cancellationToken);

        return Unit.Value;
    }


}