using FootballScore.API.Data;
using FootballScore.API.Features.Teams;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Features.Teams.GetAllTeams;

namespace FootballScore.API.Features.Teams.UpdateTeam;

public sealed class UpdateTeamCommandHandler
    : IRequestHandler<UpdateTeamCommand, TeamDto>
{
    private readonly AppDbContext _db;
    public UpdateTeamCommandHandler(AppDbContext db) => _db = db;

    public async Task<TeamDto> Handle(UpdateTeamCommand request, CancellationToken ct)
    {
        var name = request.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Team name is required.");

        var team = await _db.Teams.FirstOrDefaultAsync(t => t.Id == request.Id, ct);
        if (team is null)
            throw new KeyNotFoundException($"Team with id {request.Id} not found.");

        var exists = await _db.Teams.AnyAsync(t => t.Id != request.Id && t.Name == name, ct);
        if (exists)
            throw new ArgumentException("Team with this name already exists.");

        team.Name = name;

        await _db.SaveChangesAsync(ct);

        return new TeamDto(
    team.Id,
    team.Name ?? string.Empty,
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