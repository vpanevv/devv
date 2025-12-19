using MediatR;
using Microsoft.AspNetCore.Mvc;
using FootballScore.API.Features.Teams.GetAllTeams;
using FootballScore.API.Features.Teams.GetTeamById;
using FootballScore.API.Features.Teams.CreateTeam;


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

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TeamDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTeamByIdQuery(id), cancellationToken);

        if (result is null) return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> Create([FromBody] CreateTeamRequest request, CancellationToken cancellationToken)
    {
        var created = await _mediator.Send(new CreateTeamCommand(request.Name), cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}