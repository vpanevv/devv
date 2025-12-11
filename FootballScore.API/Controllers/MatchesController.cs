using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using FootballScore.API.Features.Matches.Commands.CreateMatch;
using FootballScore.API.Features.Matches.Commands.UpdateMatch;
using FootballScore.API.Features.Matches.Commands.DeleteMatch;
using FootballScore.API.Features.Matches.Queries.GetMatchById;
using Football.API.Features.Matches.Queries.GetAllMatches;
using Football.API.Features.Matches.Queries.GetMatchById;

namespace FootballScore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MatchesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST api/matches
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMatchCommand command)
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // GET api/matches
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllMatchesQuery());
            return Ok(result);
        }

        // GET api/matches/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(new GetMatchByIdQuery(id));
            return Ok(result);
        }

        // PUT api/matches/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMatchCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("Route id and body id must match.");
            }

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // DELETE api/matches/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _mediator.Send(new DeleteMatchCommand(id));
            return NoContent();
        }
    }
}