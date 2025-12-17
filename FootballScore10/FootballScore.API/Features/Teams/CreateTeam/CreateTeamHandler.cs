using MediatR;
using FootballScore.API.Data;
using FootballScore.API.Entities;
using System.Reflection;

namespace FootballScore.API.Features.Teams.CreateTeam;

public class CreateTeamHandler : IRequestHandler<CreateTeamCommand, int>
{
    private readonly AppDbContext _context;

    public CreateTeamHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateTeamCommand request, CancellationToken cancellationToken)
    {
        var r = request.Request;

        var team = new Team
        {
            Name = r.Name,
            Played = r.Played,
            Wins = r.Wins,
            Draws = r.Draws,
            Loses = r.Loses,
            GoalsFor = r.GoalsFor,
            GoalsAgainst = r.GoalsAgainst,
            Points = r.Wins * 3 + r.Draws,

        };

        _context.Teams.Add(team);
        await _context.SaveChangesAsync(cancellationToken);

        return team.Id;
    }
}