# ★ GAMIFY — XP Leveling System

> A production-ready gamified productivity RPG. Level up real-life skills through daily side quests.
> Inspired by retro pixel-art RPGs: Mario, Pokémon, Zelda, Undertale.

---

## Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Backend   | Python Flask + SQLAlchemy + PostgreSQL    |
| Auth      | Flask-JWT-Extended                        |
| Frontend  | React + Vite + TailwindCSS                |
| Animations| Framer Motion                             |
| State     | Zustand                                   |
| DnD       | @dnd-kit                                  |
| Charts    | Recharts                                  |
| Deploy    | Docker + Docker Compose                   |

---

## Project Structure

```
GAMIFY/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Environment configs
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── skill.py
│   │   │   ├── quest.py
│   │   │   ├── xp_log.py
│   │   │   ├── streak_log.py
│   │   │   ├── daily_stat.py
│   │   │   └── achievement.py
│   │   ├── api/                 # Flask Blueprints
│   │   │   ├── auth.py
│   │   │   ├── skills.py
│   │   │   ├── quests.py
│   │   │   ├── analytics.py
│   │   │   └── achievements.py
│   │   ├── services/            # Business logic
│   │   │   ├── xp_engine.py     # Core XP/leveling math
│   │   │   ├── quest_service.py
│   │   │   └── achievement_service.py
│   │   └── utils/
│   │       ├── validators.py
│   │       └── pagination.py
│   ├── migrations/
│   ├── run.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Pixel UI primitives
│   │   │   │   ├── PixelPanel.jsx
│   │   │   │   ├── PixelButton.jsx
│   │   │   │   ├── PixelInput.jsx
│   │   │   │   ├── PixelIcon.jsx
│   │   │   │   ├── PixelConfetti.jsx
│   │   │   │   └── XPPopup.jsx
│   │   │   ├── skills/
│   │   │   │   └── SkillCard.jsx
│   │   │   ├── quests/
│   │   │   │   └── QuestCard.jsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.jsx
│   │   │       └── AppLayout.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SkillsPage.jsx
│   │   │   ├── QuestsPage.jsx
│   │   │   ├── AchievementsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── gameStore.js
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── xpEngine.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── schema.sql
└── README.md
```

---

## Quick Start (Docker)

```bash
# Clone and enter project
cd GAMIFY

# Copy env file
cp backend/.env.example backend/.env

# Start everything
docker-compose up --build

# App runs at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## Local Development (No Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up .env
cp .env.example .env
# Edit DATABASE_URL to point to your local PostgreSQL

# Initialize database
flask --app run db init
flask --app run db migrate -m "initial"
flask --app run db upgrade
flask --app run init-db

# Start dev server
python run.py
```

### Frontend

```bash
cd frontend

npm install
npm run dev
# Runs at http://localhost:3000
```

---

## XP Formula

```
next_level_xp = 100 * level^1.5

Streak multiplier = 1.0 + min(streak * 0.033, 1.0)  → caps at 2.0x after 30 days

Difficulty multipliers:
  easy   → 0.75x
  normal → 1.0x
  hard   → 1.5x
  boss   → 2.5x

Final XP = base_xp × difficulty_mult × streak_mult
```

---

## API Reference

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/auth/register              | Register new user        |
| POST   | /api/auth/login                 | Login                    |
| GET    | /api/auth/me                    | Get current user         |
| GET    | /api/skills/                    | List skills              |
| POST   | /api/skills/                    | Create skill             |
| PUT    | /api/skills/:id                 | Update skill             |
| DELETE | /api/skills/:id                 | Delete skill             |
| GET    | /api/quests/                    | List quests (filterable) |
| GET    | /api/quests/today               | Today's quests           |
| POST   | /api/quests/                    | Create quest             |
| POST   | /api/quests/:id/complete        | Complete quest + XP      |
| POST   | /api/quests/:id/fail            | Fail quest               |
| POST   | /api/quests/reorder             | Drag-drop reorder        |
| GET    | /api/analytics/dashboard        | Full dashboard data      |
| GET    | /api/analytics/xp-history       | XP log history           |
| GET    | /api/achievements/              | All achievements         |

---

## Features

- RPG-style XP leveling with streak multipliers
- Skill decay system (optional per skill)
- Boss battle quests (2.5x XP)
- Recurring quests (daily/weekly/monthly)
- 12 unlockable achievements
- Drag-and-drop quest reordering
- Activity heatmap (90 days)
- Weekly XP bar chart
- CRT scanline overlay
- Pixel confetti on quest completion
- Level-up flash animation
- Achievement unlock popup
- JWT auth with auto-refresh
