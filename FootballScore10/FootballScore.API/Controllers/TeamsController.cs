using MediatR;
using Microsoft.AspNetCore.Mvc;
using FootballScore.API.Features.Teams.GetAllTeams;
using FootballScore.API.Features.Teams.GetTeamById;
using FootballScore.API.Features.Teams.CreateTeam;
using FootballScore.API.Features.Teams.UpdateTeam;
using FootballScore.API.Features.Teams.DeleteTeam;


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

        try
        {
            var created = await _mediator.Send(new CreateTeamCommand(request.Name), cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }

        // var created = await _mediator.Send(new CreateTeamCommand(request.Name), cancellationToken);

        // return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TeamDto>> Update(int id, [FromBody] UpdateTeamCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) return BadRequest("Route id must match body id");
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteTeamCommand(id), cancellationToken);
        return NoContent();
    }
}