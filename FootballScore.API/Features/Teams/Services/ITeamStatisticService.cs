using System.Threading;
using System.Threading.Tasks;

namespace FootballScore.API.Features.Teams.Services
{
    public interface ITeamStatisticService
    {
        Task RecalculateTeamStatisicAsync(int teamId, CancellationToken cancellationToken);
    }
}