using FootballScore.API.Data;
using FootballScore.API.Features.Teams;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Features.Standings.Shared;

namespace FootballScore.API.Features.Standings.GetStandings;

public sealed class GetStandingsQueryHandler : IRequestHandler<GetStandingsQuery, List<StandingDto>>
{
    private readonly AppDbContext _appDbContext;
    public GetStandingsQueryHandler(AppDbContext appDbContext) => _appDbContext = appDbContext;

    public async Task<List<StandingDto>> Handle(GetStandingsQuery request, CancellationToken cancellationToken)
    {
        var items = await _appDbContext.Teams
            .AsNoTracking()
            .OrderByDescending(t => t.Points)
            .ThenByDescending(t => t.GoalsFor - t.GoalsAgainst)
            .ThenByDescending(t => t.GoalsFor)
            .ThenBy(t => t.Name)
            .Select(t => new
            {
                TeamName = t.Name ?? string.Empty,
                t.Played,
                t.Wins,
                t.Draws,
                t.Loses,
                GoalDifference = t.GoalsFor - t.GoalsAgainst,
                t.Points
            })
            .ToListAsync(cancellationToken);

        // 2) добавяме позиция 1..N
        return items
            .Select((x, index) => new StandingDto(
                Position: index + 1,
                Name: x.TeamName,
                Played: x.Played,
                Wins: x.Wins,
                Draws: x.Draws,
                Loses: x.Loses,
                GoalDifference: x.GoalDifference,
                Points: x.Points
            ))
            .ToList();
    }
}