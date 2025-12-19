using MediatR;
using Microsoft.AspNetCore.Mvc;
using FootballScore.API.Features.Teams.GetAllTeams;
using FootballScore.API.Features.Teams.GetTeamById;
using System.Security.Cryptography.X509Certificates;
using System.Linq.Expressions;
using System.Xml;
using System.Net.Http.Headers;
using System.Reflection.Metadata.Ecma335;
using System.Runtime.CompilerServices;
using System.Globalization;
using Microsoft.VisualBasic;
using System.IO.Pipelines;

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
}