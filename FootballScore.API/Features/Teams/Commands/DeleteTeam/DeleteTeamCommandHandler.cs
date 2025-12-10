using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Data;
using FootballScore.API.Features.Teams.Shared;
using FootballScore.API.Models;
using MediatR;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Teams.Commands.DeleteTeam
{
    public class DeleteTeamCommandHandler : IRequestHandler<DeleteTeamCommand, Unit>
    {
        private readonly ApplicationDbContext _dbContext;

        public DeleteTeamCommandHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(DeleteTeamCommand request, CancellationToken cancellationToken)
        {
            var team = await _dbContext.Teams
            .FirstOrDefaultAsync(team => team.Id == request.Id, cancellationToken);

            if (team == null)
            {
                throw new KeyNotFoundException($"Team with ID {request.Id} not found."); // TODO: global exception handler
            }

            _dbContext.Remove(team);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value; // void from MediatR
        }

        // Task IRequestHandler<DeleteTeamCommand>.Handle(DeleteTeamCommand request, CancellationToken cancellationToken)
        // {
        //     return Handle(request, cancellationToken);
        // }
    }
}