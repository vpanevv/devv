using FootballScore.API.Features.Matches.CreateMatch;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using FootballScore.API.Features.Matches.UpdateMatch;
using FootballScore.API.Features.Matches.DeleteMatch;

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

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMatchRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new UpdateMatchCommand(
            id,
            request.HomeTeamId,
            request.AwayTeamId,
            request.HomeGoals,
            request.AwayGoals,
            request.DatePlayed), cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteMatchCommand(id), cancellationToken);
        return NoContent();
    }
}