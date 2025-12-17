using FootballScore.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Teams.GetAllTeams;

public sealed class GetAllTeamsQueryHandler : IRequestHandler<GetAllTeamsQuery, List<TeamDto>>
{
    private readonly AppDbContext _dbContext;

    public GetAllTeamsQueryHandler(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<List<TeamDto>> Handle(GetAllTeamsQuery request, CancellationToken cancellationToken)
    {
        return await _dbContext.Teams
        .AsNoTracking()
        .OrderBy(team => team.Name)
        .Select(team => new TeamDto(
            team.Id,
            team.Name,
            team.Played,
            team.Wins,
            team.Draws,
            team.Loses,
            team.GoalsFor,
            team.GoalsAgainst,
            team.Points
        ))
        .ToListAsync(cancellationToken);
    }
}