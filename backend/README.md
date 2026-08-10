# ProductPulse AI — Backend (FastAPI)

Phase 0: project foundation, database connection, Alembic, and a health check.
No feature endpoints yet — those arrive module by module, starting with
Authentication in Module 1.

## Prerequisites

- Python 3.11+
- PostgreSQL running locally (or accessible via `DATABASE_URL`)

## Setup

```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the database (adjust user/db names to match your .env)
createuser productpulse --pwprompt
createdb productpuls -O productpulse

# 4. Configure environment variables
cp .env.example .env
# edit .env — at minimum, set DATABASE_URL to match your local Postgres

# 5. Verify Alembic can reach the database (no migrations to run yet — no models exist until Module 1)
alembic current
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Health check: http://localhost:8000/api/v1/health
- Interactive docs (Swagger UI, debug mode only): http://localhost:8000/docs

## Connecting the frontend

The frontend (`productpulse-ai/`) expects the API at `http://localhost:8000` and
is already allow-listed in this backend's CORS config (`CORS_ORIGINS` in `.env`
defaults to `http://localhost:5173`, Vite's default dev port). Run both
projects side by side:

```bash
# terminal 1
cd productpulse-backend && uvicorn app.main:app --reload --port 8000

# terminal 2
cd productpulse-ai && npm run dev
```

## Tests

```bash
pytest
```

## Project structure

```
app/
├── core/            # config, logging, exceptions, shared dependencies
├── database/         # engine/session setup + Alembic migrations
├── models/            # SQLAlchemy models (empty until Module 1)
├── schemas/            # Pydantic request/response schemas (empty until Module 1)
├── repositories/        # DB access layer, one per resource (empty until Module 1)
├── services/              # business logic layer (empty until Module 1)
├── routers/                # API endpoints (health check only so far)
├── ai/                       # LLM integration (empty until Module 4)
├── utils/                      # shared utilities
└── main.py                      # app entry point — CORS, exception handlers, routers
```

Every module going forward adds files to this structure without restructuring
it — see `app/database/migrations/env.py` for where new model imports get
registered as each module introduces a table.
