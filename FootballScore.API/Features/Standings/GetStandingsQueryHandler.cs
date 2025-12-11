using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FootballScore.API.Features.Standings;
using FootballScore.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FootballScore.API.Features.Standings
{
    public class GetStandingsQueryHandler : IRequestHandler<GetStandingsQuery, IEnumerable<StandingDto>>
    {
        private readonly ApplicationDbContext _dbContext;

        public GetStandingsQueryHandler(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // gave the standings based on points, goal difference, and goals scored
        public async Task<IEnumerable<StandingDto>> Handle(GetStandingsQuery request, CancellationToken cancellationToken)
        {
            var teams = await _dbContext.Teams!
                .OrderByDescending(t => t.Points)
                .ThenByDescending(t => t.GoalsFor - t.GoalsAgainst)   // goal difference
                .ThenByDescending(t => t.GoalsFor)                    // goals scored in draw   
                .ToListAsync(cancellationToken);

            var standings = new List<StandingDto>();

            int rank = 1;
            foreach (var team in teams)
            {
                standings.Add(new StandingDto
                {
                    Rank = rank++,
                    TeamId = team.Id,
                    TeamName = team.Name!,
                    Played = team.Played,
                    Wins = team.Wins,
                    Draws = team.Draws,
                    Losses = team.Losses,
                    GoalsFor = team.GoalsFor,
                    GoalsAgainst = team.GoalsAgainst,
                    Points = team.Points
                });
            }

            return standings;
        }
    }
}