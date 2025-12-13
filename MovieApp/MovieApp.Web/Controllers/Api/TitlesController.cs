using System.Runtime.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApp.Web.Data;
using MovieApp.Web.Models;

namespace MovieApp.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class TitlesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public TitlesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> GetAll()
    {
        var titles = await _dbContext.Titles
        .OrderByDescending(t => t.AverageRating)
        .ThenBy(t => t.ReleaseYear)
        .Select(t => new
        {
            t.Id,
            t.Name,
            t.Type,
            t.ReleaseYear,
            t.PosterUrl,
            t.AverageRating,
        })
        .ToListAsync();

        return Ok(titles);
    }
}