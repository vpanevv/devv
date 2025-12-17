using MediatR;
using Microsoft.AspNetCore.Mvc;
using FootballScore.API.Features.Teams.GetAllTeams;

namespace FootballScore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TeamsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<List<TeamDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllTeamsQuery(), cancellationToken);
        return Ok(result);
    }
}