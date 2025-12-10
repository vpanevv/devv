using System.Security;
using System.Threading.Tasks;
using FootballScore.API.Features.Teams.Commands.CreateTeam;
using FootballScore.API.Features.Teams.Shared;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FootballScore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TeamsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST api/teams
        [HttpPost]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamCommand command)
        {
            // no logic, just send the command to the mediator
            var result = await _mediator.Send(command);

            // return 201 with the created team ID
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            //TODO later GetTeamByIdQuery with MediatR
            return Ok();
        }
    }
}