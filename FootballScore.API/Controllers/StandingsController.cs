using System.Threading.Tasks;
using FootballScore.API.Features.Standings;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FootballScore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StandingsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public StandingsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET api/standings
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _mediator.Send(new GetStandingsQuery());
            return Ok(result);
        }
    }
}