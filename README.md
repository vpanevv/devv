⚽ FootballScore

Modern football league management platform built with ASP.NET Core Web API and Angular.

FootballScore allows you to manage teams, create matches, track standings and automatically update the league table after each game.

⸻

✨ Features
	•	✅ Create, edit and delete teams
	•	✅ Live league standings
	•	✅ Create matches between teams
	•	✅ Automatic table updates after each match
	•	✅ Validation and business rules
	•	✅ Dark / Light theme toggle
	•	✅ Modern UI inspired by Premier League design

⸻

🏗 Tech Stack

Backend
	•	ASP.NET Core Web API
	•	Entity Framework Core
	•	MediatR (CQRS)
	•	PostgreSQL / SQL Server
	•	Clean Architecture

Frontend
	•	Angular (Standalone Components)
	•	Reactive Forms
	•	Modern UI & custom design system
	•	Dark / Light Theme

⸻

📊 Domain Model
	•	Team
	•	Match
	•	Standings

Each match automatically updates:
	•	Played matches
	•	Wins / Draws / Losses
	•	Goals for / against
	•	Goal difference
	•	Points

⸻

🚀 Getting Started

Backend

dotnet restore
dotnet run

API will run on:

http://localhost:4200/api

Frontend

npm install
npm start

Angular app runs on:

http://localhost:4200


⸻

⚙️ Business Rules
	•	Teams cannot have duplicate names
	•	Teams that have played matches cannot be deleted
	•	Matches require two different teams
	•	Standings are recalculated automatically

⸻

🎨 UI Highlights
	•	Premier League inspired table
	•	Inline match creation form
	•	Animated buttons and transitions
	•	Custom confirmation dialogs
	•	Responsive layout

⸻

🧠 Architecture
	•	CQRS with MediatR
	•	Clean separation of concerns
	•	Feature-based folder structure
	•	Reactive state updates

⸻

📌 Roadmap
	•	Player management
	•	Match events (goals, cards, assists)
	•	Statistics dashboard
	•	AI-powered match analysis
	•	Club management system
	•	SaaS deployment

⸻

👨‍💻 Author

Built with ❤️ as a full-stack football analytics platform.

⸻

📄 License

MIT License