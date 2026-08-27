# ProductPulse AI — Backend (FastAPI)

All 8 modules complete: Phase 0 (foundation), Module 1 (Authentication),
Module 2 (Product Management), Module 3 (Feedback Management), Module 4
(AI Processing Pipeline), Module 5 (Product Insights), Module 6 (AI
Roadmap Generation), Module 7 (Analytics Dashboard), Module 8 (Profile &
Settings).

## AI provider

Set `AI_API_KEY` in `.env` to use the real Anthropic client. Without a key,
the backend automatically falls back to a deterministic mock analyzer
(`app/ai/llm_client.py` → `MockLLMClient`) so the app stays fully
functional and testable without paid API calls. Every stored analysis
honestly records which one produced it in its `model_name` field —
`mock-heuristic-v1` for the fallback, the real model name otherwise.

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
createdb productpulse_db -O productpulse

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

## Endpoints so far

- `GET /api/v1/health`
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `POST /api/v1/products`, `GET /api/v1/products`, `GET /api/v1/products/{id}`, `PUT /api/v1/products/{id}`, `DELETE /api/v1/products/{id}` — all require a Bearer token; every user only ever sees their own products (BR-004).
- `POST /api/v1/feedback`, `GET /api/v1/feedback` (supports `page`, `limit`, `search`, `product_id`, `source`, `customer_type`), `GET /api/v1/feedback/{id}`, `PUT /api/v1/feedback/{id}`, `DELETE /api/v1/feedback/{id}` — ownership enforced by joining through the parent product; deleting a product cascades to its feedback (BR-006). List/get responses include a nested `analysis` object (`null` until analyzed).
- `POST /api/v1/feedback/{id}/analyze` — triggers AI analysis (retries up to 3x on malformed output, always stores a result even on total failure).
- `GET /api/v1/analysis/{feedback_id}` — read-only.
- `POST /api/v1/products/{product_id}/insights/generate` — aggregates all successfully-analyzed feedback for a product and synthesizes top pain points, user segments, feature opportunities, and revenue opportunities. Returns `400 INSUFFICIENT_DATA` if nothing's been analyzed yet.
- `GET /api/v1/products/{product_id}/insights` — reads the most recently generated insight; `404 INSIGHTS_NOT_FOUND` if none exists yet.
- `POST /api/v1/products/{product_id}/roadmap/generate` — prioritizes feature opportunities from the product's insights into a ranked roadmap. Requires insights to exist first (`400 INSIGHTS_REQUIRED` otherwise). Regenerating replaces the whole roadmap and resets item statuses to Planned.
- `GET /api/v1/products/{product_id}/roadmap` — reads the current roadmap, ordered by priority; `404 ROADMAP_NOT_FOUND` if none exists yet.
- `PATCH /api/v1/roadmap/{item_id}` — updates a single item's status (`Planned` / `In Progress` / `Completed`), independent of regeneration.
- `GET /api/v1/analytics/dashboard` — one combined payload (overview, charts, insights, recent feedback) aggregated across all of the user's products. Deterministic SQL aggregation — no LLM call, so the dashboard stays fast and free to load repeatedly.
- `PUT /api/v1/users/me` — update full name and/or email (checks email uniqueness).
- `PUT /api/v1/users/me/password` — change password; requires current password, validates new password strength.
- `PUT /api/v1/users/me/preferences` — partial update of `theme_preference` (`light`/`dark`) and `email_notifications_enabled`; omitted fields are left unchanged.

## Project structure

```
app/
├── core/            # config, logging, exceptions, shared dependencies (incl. get_current_user)
├── database/         # engine/session setup + Alembic migrations
├── models/            # User, Product, Feedback, FeedbackAnalysis, ProductInsight, RoadmapItem
├── schemas/            # Pydantic request/response schemas
├── repositories/        # DB access layer — feedback/analysis/roadmap/analytics queries join through Product for ownership
├── services/              # business logic layer; analysis/insight/roadmap services are AI orchestrators, analytics_service.py is pure aggregation
├── ai/                      # prompt_builder, validator, parser, llm_client (real + mock, handles analysis/insight/roadmap prompts)
├── routers/                  # auth, users, products, feedback, analysis, insights, roadmap, analytics, health
├── utils/                      # shared utilities
└── main.py                      # app entry point — CORS, exception handlers, routers
```

## Full test suite

```bash
pytest -v
```

67 tests across 8 test files covering every module — authentication,
authorization/ownership boundaries, validation, pagination/search/filter,
the AI pipeline (with a deterministic mock client so tests never hit a
paid API), and account management.
