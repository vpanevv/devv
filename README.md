# ⚽ FootballScore API  
A clean, maintainable **.NET 5 Web API** for managing football match results and league standings.

This project was built using **CQRS + Mediator Pattern**, **Entity Framework Core**, **SQL Server (Docker)** and includes structured feature-based architecture, automatic standings calculation, and full Swagger documentation.

---

## 🚀 Features

### 🏆 Teams
- Create a new team  
- Update a team  
- Delete a team  
- Get all teams  
- Get team statistics (matches played, wins, draws, losses, goals, points)

### ⚽ Matches (Played Only)
- Record a played match  
- Update an existing match  
- Delete a match  
- Automatically updates both teams’:
  - Points  
  - Wins / Draws / Losses  
  - Goals For & Against  
  - Played matches  

### 📊 Standings (League Table)
- Returns all teams sorted by:
  1. Points (descending)
  2. Goal Difference (descending)

### 🛡 Global Error Handling
- Centralized exception middleware  
- Converts internal exceptions into clean API error responses  

### 🗄 Database
- SQL Server running in **Docker**  
- Database schema created automatically via `EnsureCreated()`  
- Works perfectly with **VS Code MSSQL Extension**  

### 🧱 Architecture
- Feature-based folder structure  
- CQRS  
- Mediator Pattern (MediatR)  
- Domain separated into clean aggregates (Teams, Matches)  
- Services for shared logic (TeamStatisticsService)

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | **ASP.NET Core 5.0** |
| Architecture | **CQRS**, **Mediator Pattern** |
| ORM | **Entity Framework Core 5** |
| Database | **SQL Server 2019 (Docker)** |
| Documentation | **Swagger / OpenAPI** |
| DI | Built-in .NET Dependency Injection |

---

## 📦 Project Structure