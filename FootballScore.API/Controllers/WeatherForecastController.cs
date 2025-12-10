using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace FootballScore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            var list = new List<WeatherForecast>
            {
                new WeatherForecast { Date = DateTime.Now, TemperatureC = 12, Summary = "Cloudy" },
                new WeatherForecast { Date = DateTime.Now.AddDays(1), TemperatureC = 18, Summary = "Sunny" },
                new WeatherForecast { Date = DateTime.Now.AddDays(2), TemperatureC = 8, Summary = "Rainy" }
            };

            return list;
        }
    }

    public class WeatherForecast
    {
        public DateTime Date { get; set; }
        public int TemperatureC { get; set; }
        public string? Summary { get; set; }
    }
}