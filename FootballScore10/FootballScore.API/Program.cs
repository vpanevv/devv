using FootballScore.API.Data;
using MediatR;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using FootballScore.API.Entities;
using FootballScore.API.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// MediatR (CQRS)
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Controllers
builder.Services.AddControllers();

builder.Services.AddScoped<TeamStatsService>(); // TeamStatsService registration

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (за Angular после)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🔥 EnsureCreated (БЪРЗ ВАРИАНТ)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Teams.Any())
    {
        db.Teams.AddRange(
            new Team { Name = "Barcelona" },
            new Team { Name = "Real Madrid" },
            new Team { Name = "Liverpool" },
            new Team { Name = "Chelsea" }
        );

        db.SaveChanges();
    }
}

app.UseCors();
app.MapControllers();
app.Run();