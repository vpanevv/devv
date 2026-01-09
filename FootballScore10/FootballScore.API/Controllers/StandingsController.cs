using FootballScore.API.Features.Standings.GetStandings;
using MediatR;
using FootballScore.API.Features.Standings.Shared;
using Microsoft.AspNetCore.Mvc;

namespace FootballScore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StandingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StandingsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<List<StandingDto>>> GetStandings(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStandingsQuery(), cancellationToken);
        return Ok(result);
    }
}