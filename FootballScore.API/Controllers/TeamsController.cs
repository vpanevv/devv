using System.Security;
using System.Threading.Tasks;
using FootballScore.API.Features.Teams.Commands.CreateTeam;
using FootballScore.API.Features.Teams.Shared;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using FootballScore.API.Features.Teams.Queriеs.GetAllTeams;
using FootballScore.API.Features.Teams.Commands.UpdateTeam;
using FootballScore.API.Features.Teams.Commands.DeleteTeam;
using FootballScore.API.Features.Teams.Queries.GetTeamById;
using FootballScore.API.Features.Teams.Queries.GetTeamMatches;
using FootballScore.API.Features.Teams.Queries.GetTeamStats;

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

        // GET api/teams/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            //TODO later GetTeamByIdQuery with MediatR
            var team = await _mediator.Send(new GetTeamByIdQuery(id));
            return Ok(team);
        }

        // GET api/teams
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllTeamsQuery());
            return Ok(result);
        }

        // GET api/teams/{id}/matches
        [HttpGet("{id:int}/matches")]
        public async Task<IActionResult> GetTeamMatches(int id)
        {
            var result = await _mediator.Send(new GetTeamMatchesQuery(id));
            return Ok(result);
        }

        // GET api/teams/{id}/stats
        [HttpGet("{id:int}/stats")]
        public async Task<IActionResult> GetStats(int id)
        {
            var result = await _mediator.Send(new GetTeamStatsQuery(id));
            return Ok(result);
        }

        // PUT api/teams/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTeamCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("Route id and body id do not match.");
            }

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // DELETE api/teams/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _mediator.Send(new DeleteTeamCommand(id));
            return NoContent();
        }
    }
}