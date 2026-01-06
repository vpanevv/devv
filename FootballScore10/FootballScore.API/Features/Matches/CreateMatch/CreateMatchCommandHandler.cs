using FootballScore.API.Data;
using FootballScore.API.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Matches.CreateMatch;

public sealed class CreateMatchCommandHandler : IRequestHandler<CreateMatchCommand, int>
{
    private readonly AppDbContext _dbContext;
    public CreateMatchCommandHandler(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<int> Handle(CreateMatchCommand request, CancellationToken cancellationToken)
    {
        // played matches only
        if (request.DatePlayed > DateTime.UtcNow) throw new ArgumentException("DatePlayed cannot be in the future.");

        // different teams
        if (request.HomeTeamId == request.AwayTeamId) throw new ArgumentException("HomeTeamId and AwayTeamId cannot be the same.");

        // goals non-negative
        if (request.HomeGoals < 0 || request.AwayGoals < 0) throw new ArgumentException("Goals cannot be negative.");

        var homeTeam = await _dbContext.Teams.AnyAsync(t => t.Id == request.HomeTeamId, cancellationToken);
        var awayTeam = await _dbContext.Teams.AnyAsync(t => t.Id == request.AwayTeamId, cancellationToken);

        if (!homeTeam || !awayTeam) throw new ArgumentException("One or both of the specified teams do not exist.");

        var match = new Match
        {
            HomeTeamId = request.HomeTeamId,
            AwayTeamId = request.AwayTeamId,
            HomeGoals = request.HomeGoals,
            AwayGoals = request.AwayGoals,
            DatePlayed = request.DatePlayed
        };

        _dbContext.Matches.Add(match);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return match.Id;
    }
}