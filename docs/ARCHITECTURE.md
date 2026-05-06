# Architecture Guide

## System Overview

The AI SIEM Dashboard is a full-stack security operations platform composed of two main services:

1. **Backend API** (Python/FastAPI) — Handles log ingestion, threat detection, incident management, and authentication
2. **Frontend Dashboard** (Next.js/TypeScript) — Provides the user interface for monitoring and managing security incidents

## Backend Architecture

### Layered Design

```
api/          ← HTTP interface, routing, auth middleware
  │
core/         ← Configuration, security primitives
  │
services/     ← Business logic (detection, analysis, storage)
  │
data/         ← Persistence layer (JSON file storage)
```

### Module Breakdown

| Module | File | Responsibility |
|--------|------|---------------|
| `api.app` | FastAPI application, route handlers, CORS, JWT middleware |
| `api.schemas` | Pydantic request/response models |
| `core.config` | Logging setup, domain constants |
| `core.security` | Password hashing (bcrypt), JWT creation/verification, credential validation |
| `services.ai_analyzer` | Rule-based classification with optional LLM enhancement |
| `services.incident_engine` | Event correlation, risk scoring, incident lifecycle |
| `services.ingestion` | JSONL log streaming and alert normalization |
| `services.pipeline` | Orchestrates analysis → incident processing |
| `services.storage` | JSON file read/write with error handling |
| `services.reporting` | Human-readable incident report generation |

### Detection Pipeline

```
Log File (JSONL)
    │
    ▼
┌─────────────┐
│  Ingestion  │  Read new lines, parse JSON, normalize
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Pipeline   │  Route: analyze → process
└──────┬──────┘
       │
       ├─────────────────┐
       ▼                 ▼
┌─────────────┐   ┌──────────────────┐
│ AI Analyzer  │   │ Incident Engine  │
│ (rule + AI)  │   │ (correlate, score)│
└─────────────┘   └────────┬─────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Storage   │  JSON file persistence
                    └─────────────┘
```

### Authentication

- Passwords are hashed with bcrypt via `passlib`
- JWT tokens are signed with `python-jose` using HS256
- Tokens include `exp` claim for automatic expiration
- All protected routes use `HTTPBearer` dependency injection
- No plaintext passwords exist in source code or storage

## Frontend Architecture

### Page Structure

```
app/
  page.tsx          ← Main dashboard (incident grid)
  layout.tsx        ← Root layout with Sidebar + Navbar
  globals.css       ← Global styles
  login/            ← Authentication page
  incidents/        ← Incident detail views
  analytics/        ← Threat statistics
  settings/         ← System configuration
```

### Component Structure

```
components/
  IncidentCard.tsx  ← Individual incident display with actions
  Navbar.tsx        ← Top navigation bar
  Sidebar.tsx       ← Side navigation menu
```

### Utility Layer

```
lib/
  api.ts            ← API client with auth, retry, type validation
  useAuth.ts        ← Authentication state hook

hooks/
  useAuth.ts        ← (re-export from lib)
```

### Authentication Flow

1. User submits credentials on `/login`
2. Frontend calls `POST /login` on backend
3. Backend validates against bcrypt hash, returns JWT
4. Frontend stores token in `localStorage`
5. `useAuth()` hook checks token presence, redirects if missing
6. All API calls include `Authorization: Bearer <token>`
7. 401 responses trigger automatic logout and redirect

## Security Model

### Threat Mitigations

| Threat | Mitigation |
|--------|-----------|
| Plaintext passwords | bcrypt hashing, no source code storage |
| Token theft | 60-minute expiration, HTTPS required in production |
| CORS abuse | Restricted origin whitelist |
| XSS | HTML escaping on all user-facing outputs |
| Input injection | Regex validation on IDs, IP format checking |
| Secret leakage | Environment variables only, .env in .gitignore |
| Stack trace exposure | Global exception handler returns generic error |

### Environment Security

- `SECRET_KEY` — Required for JWT signing, no fallback in production code
- `ADMIN_PASSWORD_HASH` — bcrypt hash, never plaintext
- `OPENROUTER_API_KEY` — Optional, graceful fallback to rule-based analysis
- All secrets loaded via `python-dotenv` from `.env` file
- `.env` and `.env.local` excluded from git via `.gitignore`

## Deployment

### Backend on Render

- Root directory: `backend/`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn api.app:app --host 0.0.0.0 --port $PORT`
- Environment: Set all variables from `.env.example`

### Frontend on Vercel

- Framework: Next.js (auto-detected)
- Environment: `NEXT_PUBLIC_API_URL` pointing to Render backend
- Build: `next build` (auto)

## Data Model

### Incident Schema

```json
{
  "id": "INC-001",
  "source_ip": "192.168.1.10",
  "risk_score": 80,
  "status": "active",
  "events": ["brute_force", "brute_force"],
  "event_count": 2,
  "first_seen": "2026-05-04T10:00:00Z",
  "last_seen": "2026-05-04T10:05:00Z",
  "count": 2,
  "created_at": "2026-05-04T10:00:00Z",
  "analysis": {
    "threat_type": "Brute Force Attack",
    "severity": "High",
    "explanation": "...",
    "recommended_action": "..."
  }
}
```

### Risk Scoring

- Base score: 50
- Event weight: brute_force=30, port_scan=20, unknown=10
- Severity weight: High=30, Medium=20, Low=10
- Maximum: 100 (capped)
- Cumulative: each new event adds to existing score
