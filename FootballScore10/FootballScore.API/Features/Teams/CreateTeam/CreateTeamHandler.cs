using FootballScore.API.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Features.Teams.GetAllTeams;
using FootballScore.API.Data;

namespace FootballScore.API.Features.Teams.CreateTeam;

public sealed class CreateTeamCommandHandler : IRequestHandler<CreateTeamCommand, TeamDto>
{
    private readonly AppDbContext _dbContext;

    public CreateTeamCommandHandler(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<TeamDto> Handle(CreateTeamCommand request, CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Team name is required.");

        var exist = await _dbContext.Teams.AnyAsync(t => t.Name == name, cancellationToken);

        if (exist) throw new ArgumentException("Team with this name aldready exist.");

        var team = new Team
        {
            Name = name,
            Played = 0,
            Wins = 0,
            Draws = 0,
            Loses = 0,
            GoalsFor = 0,
            GoalsAgainst = 0,
            Points = 0
        };

        _dbContext.Teams.Add(team);
        await _dbContext.SaveChangesAsync(cancellationToken);

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