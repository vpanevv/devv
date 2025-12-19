using System.Data.Common;
using FootballScore.API.Features.Matches.CreateMatch;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FootballScore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MatchesController : ControllerBase
{
    private readonly IMediator _mediator;

    public MatchesController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreateMatchRequest request, CancellationToken cancellationToken)
    {
        var matchId = await _mediator.Send(new CreateMatchCommand(
            request.HomeTeamId,
            request.AwayTeamId,
            request.HomeGoals,
            request.AwayGoals,
            request.DatePlayed), cancellationToken);

        return Ok(matchId);
    }
}