using FootballScore.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Teams.DeleteTeam;

public sealed class DeleteTeamCommandHandler : IRequestHandler<DeleteTeamCommand, Unit>
{
    private readonly AppDbContext _dbContext;
    public DeleteTeamCommandHandler(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(DeleteTeamCommand request, CancellationToken cancellationToken)
    {
        var team = await _dbContext.Teams.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (team is null) throw new KeyNotFoundException($"Team with id {request.Id} not found.");

        _dbContext.Teams.Remove(team);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }


}