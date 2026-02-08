# MonVoyage Trip Planner

An AI-powered itinerary engine that generates feasible, day-by-day travel plans for any city worldwide. Built with FastAPI, Gemini AI, Apache Airflow, and PostgreSQL.

## Features

- **Natural Language Input** - Describe your trip in plain English; the AI extracts dates, budget, interests, and preferences automatically
- **Multi-City Support** - Works for any city (Toronto, Paris, Tokyo, etc.) with configurable defaults
- **Real Venue Data** - Airflow pipeline scrapes venue websites daily; itineraries use verified, up-to-date venue information
- **Smart Itinerary Generation** - Gemini AI creates day-by-day timetables respecting budget, pace, and interest constraints
- **Feasibility Validation** - Every itinerary is checked for schedule conflicts, budget overruns, and missing meals
- **Conversational Refinement** - Multi-turn chat to progressively build complete trip preferences
- **Auto-Generated API Docs** - Swagger UI and ReDoc available out of the box

## Quick Start

### 1. Prerequisites

- Python 3.9+
- PostgreSQL 12+ (for venue database)
- Node.js 16+ (for frontend dev server, optional)
- Docker & Docker Compose (recommended for PostgreSQL)

### 2. Clone & Environment Setup

```bash
# Clone the repository
git clone <repo-url> && cd MonVoyage

# Create and activate Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

### 3. Database Preparation (PostgreSQL + Airflow)

#### Prerequisites

- Docker Desktop installed and running
- `docker compose` available
- `curl` and `psql` (optional but helpful)

#### Getting Started

**1. Build and start all services:**

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

**2. Verify containers are running:**

```bash
docker compose -f docker-compose.dev.yml ps
```

Expected containers: `airflow-webserver`, `airflow-scheduler`, `airflow-postgres`, `appdb`, `chroma`.

#### Create Airflow Admin User and Initialize Database

**1. Create admin user for Airflow:**

```bash
docker compose -f docker-compose.dev.yml exec airflow-webserver bash -lc '
airflow users create \
  --username admin \
  --password admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com
'
```

**2. Seed venue data:**

```bash
docker compose -f docker-compose.dev.yml exec airflow-webserver bash -lc \
"python /opt/airflow/dags/lib/seed_tracked_sites.py"
```

#### Launch Airflow UI

Open http://localhost:8080/home and login with `admin` / `admin`.

The `website_change_monitor` DAG will begin scraping venues into the database.

#### Verify Database Setup

**1. Access the database:**

```bash
docker compose -f docker-compose.dev.yml exec appdb psql -U app -d app
```

**2. View tables:**

```sql
\dt
```

**3. Query places (venues):**

```sql
SELECT id, place_key, canonical_name, category FROM places;
```

**4. Query tracked pages (websites being monitored):**

```sql
SELECT id, place_id, url, page_type, extract_strategy, enabled FROM tracked_pages;
```

**5. Query snapshots (latest scraped data):**

```sql
SELECT id, tracked_page_id, content_hash, checked_at FROM page_snapshots ORDER BY checked_at DESC LIMIT 5;
```

**6. Exit psql:**

```sql
\q
```

### 4. Backend Configuration

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend/.env with your API keys
```

**Required in `.env`:**
- `GEMINI_KEY`: Get from https://aistudio.google.com/apikey
- `GROQ_API_KEY` (optional fallback): Get from https://console.groq.com/keys

**Optional database settings:**
- `APP_DB_URL`: Database connection string (default: `postgresql+psycopg2://app:app@localhost:5432/app`)

### 5. Start Backend Server

```bash
# From the MonVoyage directory
python backend/app.py
```

Backend runs at **http://localhost:8000** with:
- Chat UI: http://localhost:8000/
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc

### 6. Frontend Setup (Optional)

The built-in frontend at `http://localhost:8000/` is served from `frontend/index.html`.

For development with hot reload:

```bash
cd frontend

# Install Node.js dependencies (if package.json exists)
npm install

# Start Vite dev server
npm run dev
```

Frontend will be at http://localhost:5173 in development mode.

---

## Detailed Setup Guides

### Database Setup Guide

#### What the Database Stores

The PostgreSQL database (managed by Airflow) stores:
- **places**: Venues (restaurants, museums, hotels, etc.)
- **tracked_pages**: Websites being scraped daily
- **page_snapshots**: Historical web page data
- **place_facts**: Venue attributes (address, hours, price, etc.)
- **change_events**: Change detection logs

#### Initialization Steps

```bash
# 1. Ensure PostgreSQL is running
docker-compose -f docker-compose.dev.yml up -d postgres

# 2. Initialize Airflow database schema
cd airflow
airflow db resetdb  # Reset if needed, or just: airflow db init

# 3. Create Airflow admin account
airflow users create \
  --username admin \
  --password admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com

# 4. Seed initial venue data
python dags/lib/seed_tracked_sites.py

# 5. Verify database connection
python -c "
import sys
sys.path.insert(0, 'dags/lib')
from database import get_db_session
session = get_db_session()
print('✅ Database connected')
session.close()
"
```

#### Connection String Format

```
postgresql+psycopg2://username:password@host:port/database

# Example:
postgresql+psycopg2://app:app@localhost:5432/app
```

### Backend Setup Guide

#### Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
# Required
GEMINI_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here  # Optional fallback

# Optional - API Configuration
GROQ_MODEL=openai/gpt-oss-120b
GEMINI_MODEL=gemini-3-flash-preview
GROQ_TIMEOUT=60
GEMINI_TIMEOUT=60
GEMINI_MAX_RETRIES=3

# Optional - Server
HOST=127.0.0.1
PORT=8000
DEBUG=True

# Optional - Database
APP_DB_URL=postgresql+psycopg2://app:app@localhost:5432/app

# Optional - Defaults
DEFAULT_CITY=Toronto
DEFAULT_COUNTRY=Canada
EXTRACTION_TEMPERATURE=0.2
ITINERARY_TEMPERATURE=0.7
```

#### Starting the Backend

```bash
# Basic
python backend/app.py

# With verbose logging
DEBUG=True python backend/app.py

# With custom port
PORT=9000 python backend/app.py

# Using gunicorn for production (install: pip install gunicorn)
gunicorn -w 4 -b 0.0.0.0:8000 backend.app:app
```

#### Health Check

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "MonVoyage Trip Planner",
  "model": "gemini-3-flash-preview",
  "nlp_service_ready": true,
  "error": null
}
```

### Frontend Setup Guide

#### Development (With Hot Reload)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be at **http://localhost:5173** with hot reload enabled.

#### Production Build

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build optimized bundle
npm run build

# Serve from backend (app.py serves index.html automatically)
```

#### File Structure

```
frontend/
├── index.html          # Main entry point (served by FastAPI)
├── src/
│   ├── main.jsx        # React component root
│   ├── App.jsx         # Main app component
│   └── components/     # React components
├── package.json        # NPM dependencies
└── vite.config.js      # Vite configuration
```

#### Customization

Edit `frontend/index.html` and components in `frontend/src/` to customize the chat UI appearance and behavior.

#### Connection to Backend

The frontend connects to the backend API at:
- Development: `http://localhost:8000`
- Production: Same origin (automatic via relative URLs)

---

## Complete Startup Sequence

### One Command: Start Everything

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

This starts PostgreSQL, Airflow, and Chroma simultaneously.

### Multi-Terminal Setup (Alternative)

#### Terminal 1: Start all Docker services

```bash
docker compose -f docker-compose.dev.yml up
```

Services start at:
- Airflow UI: http://localhost:8080
- Postgres: localhost:5432
- Chroma: http://localhost:8000

#### Terminal 2: Initialize Airflow (one-time only)

```bash
# Create admin user
docker compose -f docker-compose.dev.yml exec airflow-webserver bash -lc '
airflow users create \
  --username admin \
  --password admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com
'

# Seed venue data
docker compose -f docker-compose.dev.yml exec airflow-webserver bash -lc \
"python /opt/airflow/dags/lib/seed_tracked_sites.py"
```

#### Terminal 3: Backend Server

```bash
python backend/app.py
```

Backend runs at **http://localhost:8000**.

#### Terminal 4 (Optional): Frontend Dev Server

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** (with hot reload).

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Chat UI** | http://localhost:8000 | — |
| **API Docs** | http://localhost:8000/docs | — |
| **Airflow** | http://localhost:8080 | admin/admin |
| **Frontend Dev** | http://localhost:5173 | — |

## Architecture

```
User (chat UI)
    |
    v
FastAPI (app.py)  ------>  Swagger UI (/docs)
    |
    +---> NLPExtractionService (Gemini/Groq)
    |         |
    |         v
    |     TripPreferences (validated)
    |
    +---> ItineraryService
    |         |
    |         +--- VenueService ---> PostgreSQL (Airflow DB)
    |         |
    |         +--- GeminiClient ---> Gemini API
    |         |
    |         v
    |     Itinerary (day-by-day timetable)
    |
    +---> Airflow DAGs (daily web scraping)
              |
              v
          PostgreSQL (places, tracked_pages, snapshots)
```

### Service Responsibilities

| Service | Role |
|---------|------|
| **NLPExtractionService** | Extracts structured trip preferences from natural language via Gemini (primary) or Groq (fallback) |
| **ItineraryService** | Generates day-by-day itineraries using Gemini AI + real venue data from the Airflow database |
| **VenueService** | Queries the Airflow-managed PostgreSQL database for venue information matching the user's city and interests |
| **GeminiClient** | Async wrapper for the Google Gemini API |
| **GroqClient** | Sync wrapper for the Groq API (fallback LLM) |

## API Reference

All endpoints return JSON. Auto-generated docs are at `/docs` (Swagger) and `/redoc` (ReDoc).

### `GET /api/health`

Returns service status and active LLM configuration.

```bash
curl http://localhost:8000/api/health
```

```json
{
  "status": "healthy",
  "service": "MonVoyage Trip Planner",
  "primary_llm": "gemini",
  "model": "Gemini (gemini-3-flash-preview)",
  "nlp_service_ready": true,
  "error": null
}
```

### `POST /api/extract`

Extract trip preferences from a natural language message.

```bash
curl -X POST http://localhost:8000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"user_input": "I want to visit Toronto from March 15-17, 2026. Budget $300. Museums and food."}'
```

```json
{
  "success": true,
  "preferences": {
    "city": "Toronto",
    "country": "Canada",
    "start_date": "2026-03-15",
    "end_date": "2026-03-17",
    "budget": 300.0,
    "budget_currency": "CAD",
    "interests": ["Culture and History", "Food and Beverage"],
    "pace": "moderate"
  },
  "validation": {
    "valid": false,
    "issues": ["Missing: location_preference"],
    "warnings": [],
    "completeness_score": 0.8
  },
  "bot_message": "Great choice! Where in Toronto would you prefer to stay?",
  "saved_to_file": null
}
```

### `POST /api/refine`

Refine previously extracted preferences with additional user input.

```bash
curl -X POST http://localhost:8000/api/refine \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {"city": "Toronto", "country": "Canada", "budget": 300},
    "additional_input": "I prefer downtown and I am vegetarian"
  }'
```

### `POST /api/generate-itinerary`

Generate a complete day-by-day itinerary from finalized preferences. Requires all 10 mandatory fields.

```bash
curl -X POST http://localhost:8000/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "city": "Toronto",
      "country": "Canada",
      "location_preference": "downtown",
      "start_date": "2026-03-15",
      "end_date": "2026-03-17",
      "duration_days": 3,
      "budget": 300.0,
      "budget_currency": "CAD",
      "interests": ["Culture and History", "Food and Beverage"],
      "pace": "moderate"
    }
  }'
```

```json
{
  "success": true,
  "itinerary": {
    "trip_id": "TRIP-20260215-abc123",
    "days": [
      {
        "day_number": 1,
        "date": "2026-03-15",
        "activities": [
          {
            "activity_id": "ACT-001",
            "venue_name": "Royal Ontario Museum",
            "planned_start": "09:30",
            "planned_end": "11:30",
            "category": "Culture and History",
            "estimated_cost": 23.0,
            "from_database": true
          }
        ]
      }
    ]
  },
  "feasibility": {
    "feasible": true,
    "issues": [],
    "warnings": []
  }
}
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3-flash-preview` | Gemini model name |
| `GROQ_API_KEY` | No | — | Groq API key (fallback LLM) |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model name |
| `HOST` | No | `127.0.0.1` | Server bind address |
| `PORT` | No | `8000` | Server port |
| `DEBUG` | No | `True` | Enable hot reload |
| `APP_DB_URL` | No | `postgresql+psycopg2://app:app@localhost:5432/app` | Airflow venue database URL |
| `DEFAULT_CITY` | No | `Toronto` | Default city for NLP extraction |
| `DEFAULT_COUNTRY` | No | `Canada` | Default country |
| `EXTRACTION_TEMPERATURE` | No | `0.2` | Gemini temperature for NLP extraction |
| `ITINERARY_TEMPERATURE` | No | `0.7` | Gemini temperature for itinerary generation |

### API Keys

1. **Gemini** (required): Get a key at https://aistudio.google.com/apikey
2. **Groq** (optional fallback): Get a key at https://console.groq.com/keys

## Airflow Venue Pipeline

The Airflow pipeline scrapes venue websites daily and stores structured data in PostgreSQL. The FastAPI backend reads this data to inject real venues into AI-generated itineraries.

### Quick Setup

Detailed setup instructions are in the **Database Setup Guide** above. Quick reference:

```bash
# 1. Start PostgreSQL (Docker)
docker-compose -f docker-compose.dev.yml up -d postgres

# 2. Initialize Airflow & seed venues
cd airflow
airflow db init
airflow users create --username admin --password admin --firstname Admin --lastname User --role Admin --email admin@example.com
python dags/lib/seed_tracked_sites.py

# 3. Start Airflow services
airflow scheduler &
airflow webserver --port 8080
```

Access Airflow UI at http://localhost:8080 to monitor DAG runs.

### How It Works

1. **Airflow DAGs** scrape venue websites daily via the `website_change_monitor` DAG
2. Scraped data is stored in PostgreSQL: `places`, `tracked_pages`, `page_snapshots`, `place_facts`, `change_events`
3. **VenueService** queries these tables to find venues matching the user's city and interests
4. Venue data is injected into the Gemini prompt so the AI uses verified, real venues
5. Activities sourced from the database are tagged with `from_database: true`

### Graceful Degradation

If PostgreSQL is unreachable, the itinerary service still works. It generates itineraries using Gemini's general knowledge without real venue data.

## Project Structure

```
MonVoyage/
├── backend/
│   ├── app.py                   # FastAPI application (uvicorn, port 8000)
│   ├── config/settings.py       # Centralized configuration
│   ├── schemas/api_models.py    # Pydantic request/response schemas
│   ├── models/
│   │   ├── trip_preferences.py  # TripPreferences dataclass
│   │   └── itinerary.py         # Itinerary + Activity dataclasses
│   ├── services/
│   │   ├── nlp_extraction_service.py   # NLP preference extraction (async)
│   │   ├── itinerary_service.py        # Itinerary generation (async)
│   │   └── venue_service.py            # Airflow DB venue queries
│   ├── clients/
│   │   ├── gemini_client.py     # Gemini API wrapper (async)
│   │   └── groq_client.py       # Groq API wrapper (sync)
│   ├── utils/id_generator.py    # Trip/itinerary ID generation
│   └── .env.example             # Environment variable template
├── airflow/dags/
│   ├── website_monitor_dag.py   # Daily web scraping DAG
│   └── lib/                     # DAG support modules
├── frontend/
│   └── index.html               # Chat UI (single-page app)
├── test/                        # Test and demo scripts
├── requirements.txt             # Python dependencies
├── CLAUDE.md                    # AI assistant context
└── README.md                    # This file
```

## Development

```bash
# Format code
black backend/

# Lint code
flake8 backend/

# Run tests
pytest test/

# Run with verbose logging
LOG_LEVEL=DEBUG python backend/app.py
```

## Tech Stack

- **Backend**: FastAPI + uvicorn (async Python)
- **AI/NLP**: Google Gemini API (primary), Groq API (fallback)
- **Validation**: Pydantic v2
- **Database**: PostgreSQL + SQLAlchemy
- **Data Pipeline**: Apache Airflow
- **Vector Search**: Chroma (RAG retrieval)
- **Frontend**: Vanilla HTML/CSS/JS (chat interface)

## License

MIT
