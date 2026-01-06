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


}