# ⚽ FootballScore

FootballScore is a modern football league management web application built with **.NET Web API** and **Angular UI**.

The system allows you to manage teams, matches and automatically calculate league standings in real time.

---

## 🚀 Features

### 🏆 Standings
- Automatic ranking by points
- Goal difference and goals scored
- League positions (1,2,3…)
- Real-time updates after each match

### 👥 Team Management
- Create teams
- Edit team names
- Delete teams (with validation if matches exist)
- Unique name validation

### ⚽ Match Management
- Create matches between teams
- Enter match results
- Automatic team statistics recalculation

### 🎨 UI
- Dark / Light theme toggle
- Modern Premier League inspired design
- Responsive layout
- Standings table and match form on the same page

---

## 🛠 Tech Stack

### Backend
- **.NET Web API**
- **Entity Framework Core**
- **MediatR (CQRS Pattern)**
- **SQL Server**
- Clean Architecture

### Frontend
- **Angular (Standalone Components)**
- Reactive Forms
- RxJS
- SCSS
- Custom Theme System (Dark / Light)

---

## 🏗 Architecture

### Backend Structure
FootballScore.API
├── Controllers
├── Data (DbContext)
├── Entities
├── Features
│   ├── Teams
│   ├── Matches
│   └── Standings
└── Program.cs

### Frontend Structure
footballscore-ui
├── pages
│   ├── standings
│   ├── teams
│   └── matches
├── api
├── theme
└── app.routes.ts

---

## ▶ Getting Started

### Backend

```bash
cd FootballScore.API
dotnet restore
dotnet run
``` 
### API will start on:

```bash
http://localhost:5119
``` 

### Swagger:

```bash
http://localhost:5119/swagger
```