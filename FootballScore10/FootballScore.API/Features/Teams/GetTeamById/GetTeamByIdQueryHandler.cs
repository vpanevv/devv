using FootballScore.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Features.Teams.GetAllTeams;

namespace FootballScore.API.Features.Teams.GetTeamById;

public sealed class GetTeamByIdQueryHandler : IRequestHandler<GetTeamByIdQuery, TeamDto?>
{
    private readonly AppDbContext _dbContext;

    public GetTeamByIdQueryHandler(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<TeamDto?> Handle(GetTeamByIdQuery request, CancellationToken cancellationToken)
    {
        var team = await _dbContext.Teams
        .AsNoTracking()
        .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (team is null) return null;

        return new TeamDto(
            team.Id,
            team.Name,
            team.Played,
            team.Wins,
            team.Draws,
            team.Loses,
            team.GoalsFor,
            team.GoalsAgainst,
            team.Points
        );
    }
}