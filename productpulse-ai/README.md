# ProductPulse AI — Frontend (React + Vite)

Every module talks to the real FastAPI backend: Authentication, Products,
Feedback, AI Analysis, Product Insights, Roadmap, Dashboard, and
Profile/Settings (edit profile, change password, theme + notification
preferences). No mock data remains in active use.

## Setup

```bash
npm install
cp .env.example .env   # defaults to http://localhost:8000/api/v1 — adjust if your backend runs elsewhere
```

## Run

Requires the backend running first (see `productpulse-backend/README.md`):

```bash
# terminal 1
cd productpulse-backend && uvicorn app.main:app --reload --port 8000

# terminal 2
cd productpulse-ai && npm run dev
```

Open the printed `localhost` URL (default: http://localhost:5173).

- Register a new account, or log in directly — the backend seeds no demo
  user of its own (that was mock-only); register once to create your first
  real account in Postgres.
- If the backend isn't running, register/login will show a clear error
  message rather than failing silently — check `api/axios.js` for the
  error-normalization logic if you need to debug a failed request.

## Lint & build

```bash
npm run lint
npm run build
```
