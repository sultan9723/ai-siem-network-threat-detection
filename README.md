# AI SIEM Dashboard — Real-Time Network Threat Detection System

A full-stack Security Information and Event Management (SIEM) platform that ingests, analyzes, and visualizes network security events in real time using AI-driven threat detection and an incident response engine.

---

## Problem Statement

Modern network infrastructure faces continuous exposure to cybersecurity threats including brute-force attacks, port scanning, unauthorized access attempts, and reconnaissance activity. Traditional monitoring tools lack real-time intelligence, automated threat classification, and actionable incident management. Security teams need a centralized platform that combines automated detection, AI-enhanced analysis, and an intuitive dashboard for rapid response.

---

## Objectives

- Detect and classify network threats in real time from raw log streams
- Enhance rule-based detection with optional AI analysis via external LLM
- Automate incident correlation, scoring, and lifecycle management
- Provide a modern dashboard for security operations visualization
- Implement role-based access control with JWT authentication
- Build a production-ready, secure, full-stack application suitable for SOC environments

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI SIEM SYSTEM ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐                  │
│  │  Log      │───▶│  Ingestion   │───▶│  Pipeline  │                  │
│  │  Sources  │    │  Layer       │    │  Engine    │                  │
│  │           │    │  (JSONL)     │    │            │                  │
│  └──────────┘    └──────────────┘    └─────┬─────┘                  │
│                                            │                        │
│                                            ▼                        │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐                  │
│  │  AI      │◀───│  AI Analyzer │    │  Incident  │                  │
│  │  (LLM)   │    │  (Optional)  │    │  Engine    │                  │
│  └──────────┘    └──────────────┘    └─────┬─────┘                  │
│                                            │                        │
│                                            ▼                        │
│                                     ┌──────────────┐                │
│                                     │  Storage     │                │
│                                     │  (JSON File) │                │
│                                     └──────┬───────┘                │
│                                            │                        │
│                                            ▼                        │
│                                     ┌──────────────┐                │
│                                     │  FastAPI     │                │
│                                     │  REST API    │                │
│                                     └──────┬───────┘                │
│                                            │                        │
│                                     ┌──────┴───────┐                │
│                                     │  JWT Auth    │                │
│                                     │  Middleware  │                │
│                                     └──────┬───────┘                │
│                                            │                        │
│                                            ▼                        │
│                                     ┌──────────────┐                │
│                                     │  Frontend    │                │
│                                     │  (Next.js)   │                │
│                                     └──────────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Log Sources** — Wazuh, firewall, or application logs in JSONL format
2. **Ingestion** — File watcher streams new log entries, normalizes into alert objects
3. **Pipeline** — Routes each alert through rule-based and optional AI analysis
4. **Incident Engine** — Correlates events by source IP, calculates risk scores, creates or updates incidents
5. **Storage** — Persists incidents to JSON file with full event history
6. **API** — FastAPI serves REST endpoints with JWT-protected routes
7. **Frontend** — Next.js dashboard displays incidents, analytics, and incident management

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| Ingestion | Read log streams, parse JSON, normalize into structured alerts |
| AI Analyzer | Rule-based classification with optional LLM enhancement via OpenRouter |
| Incident Engine | Event correlation, risk scoring, incident lifecycle management |
| Storage | CRUD operations on incident data with error handling and logging |
| API | REST endpoints, JWT authentication, CORS, request validation |
| Frontend | Dashboard UI, real-time polling, incident actions, role-based views |

---

## Tech Stack

### Backend
- **Python 3.11+** — Core runtime
- **FastAPI** — High-performance REST API framework
- **Uvicorn** — ASGI server
- **python-jose** — JWT token generation and validation
- **passlib[bcrypt]** — Password hashing and verification
- **python-dotenv** — Environment variable management
- **Pydantic** — Request/response validation

### Frontend
- **Next.js 16** — React framework with App Router
- **TypeScript** — Type-safe frontend code
- **Tailwind CSS v4** — Utility-first styling
- **Lucide React** — Icon library
- **react-hot-toast** — Notification system

### DevOps & Infrastructure
- **Render** — Backend API hosting
- **Vercel** — Frontend hosting
- **Git** — Version control

---

## Features

### Threat Detection
- Real-time log stream ingestion from JSONL files
- Rule-based event classification (brute force, port scan, unknown)
- AI-enhanced threat analysis via OpenRouter LLM (optional, graceful fallback)
- Automatic incident correlation by source IP
- Dynamic risk scoring based on event type and severity

### Incident Management
- Incident creation, update, and lifecycle tracking
- Status management: active, resolved, escalated, false_positive
- Event count tracking and temporal analysis (first_seen, last_seen)
- Human-readable incident report generation

### Dashboard & Visualization
- Real-time incident grid with risk score indicators
- Severity classification with color-coded cards
- Analytics page with aggregated threat statistics
- Incident detail view with full event history and analysis
- Settings page for system configuration

### Authentication & Access Control
- JWT-based authentication with automatic token expiration
- Password hashing via bcrypt (no plaintext storage)
- Protected API routes with token validation middleware
- Role-based access: Admin (full access) and Viewer (read-only)

---

## Security Features

### Password Security
- All passwords hashed using bcrypt with random salt
- Zero plaintext password storage or comparison
- Hashed credentials stored in environment variables, not source code
- `verify_password()` uses timing-safe comparison via passlib

### Authentication
- JWT tokens with configurable expiration (default: 60 minutes)
- Tokens validated on every protected API request
- Automatic session invalidation on token expiry
- Bearer token authentication via HTTP Authorization header

### API Security
- CORS restricted to specific frontend domains
- Input validation on all route parameters (incident ID regex, IP format)
- XSS prevention via HTML escaping on frontend rendering
- Global exception handler prevents stack trace leakage

### Environment Security
- All secrets loaded from environment variables
- `SECRET_KEY` required for JWT signing — no hardcoded fallback in production
- `.env` and `.env.local` excluded from version control
- Separate `.env.example` files provided for configuration reference

---

## User Roles

### Admin
- Full system access
- Authenticate via login page
- View, resolve, and escalate incidents
- Access analytics dashboard and settings
- Full API access including PATCH operations on incidents

### Viewer (Read-Only)
- View dashboard and incident list
- View incident details and reports
- View analytics page
- No action capabilities (cannot resolve, escalate, or modify incidents)
- Read-only API access (GET endpoints only)

> **Note:** Role enforcement at the API level is documented for implementation. The current system provides Admin-level access for all authenticated users. Role-based route protection in the API is a planned enhancement.

---

## Authentication Flow

```
┌──────────┐     POST /login      ┌──────────┐
│          │ ───────────────────▶ │          │
│  Client  │                      │  Server  │
│          │ ◀─────────────────── │          │
└──────────┘   {access_token}     └──────────┘
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │  Verify       │
                                 │  credentials  │
                                 │  (bcrypt)     │
                                 └──────┬───────┘
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │  Generate     │
                                 │  JWT token    │
                                 │  (exp: 60m)   │
                                 └──────────────┘
```

### Flow Description

1. Client sends `POST /login` with `{username, password}`
2. Server validates username and verifies password against stored bcrypt hash
3. On success, server generates JWT with payload `{sub: username, exp: <timestamp>}`
4. Client stores token in `localStorage`
5. All subsequent requests include `Authorization: Bearer <token>` header
6. Server middleware decodes and validates token on protected routes
7. Expired or invalid tokens return `401 Unauthorized`, triggering client-side logout

---

## Project Structure

```
ai-siem-network-threat-detection/
├── README.md
├── .gitignore
├── .env.example
├── .env.local                    # Frontend env (gitignored)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── next-env.d.ts
├── LICENSE
│
├── backend/                      # Python SIEM backend
│   ├── main.py                   # Entry point (uvicorn)
│   ├── requirements.txt
│   ├── .env.example
│   │
│   ├── api/                      # API layer
│   │   ├── __init__.py
│   │   ├── app.py                # FastAPI app + routes
│   │   └── schemas.py            # Pydantic models
│   │
│   ├── core/                     # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py             # Logging, constants
│   │   └── security.py           # Auth, JWT, password hashing
│   │
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   ├── ai_analyzer.py        # Rule-based + AI analysis
│   │   ├── incident_engine.py    # Incident correlation & scoring
│   │   ├── ingestion.py          # Log stream ingestion
│   │   ├── pipeline.py           # Alert processing pipeline
│   │   ├── reporting.py          # Report generation
│   │   └── storage.py            # Data persistence
│   │
│   ├── data/                     # Data files
│   │   └── incidents.json
│   │
│   └── tests/                    # Backend tests
│       ├── __init__.py
│       ├── test_analyzer.py
│       └── test_pipeline.py
│
├── frontend/                     # Next.js frontend (source at root)
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── globals.css
│   │   │   ├── login/
│   │   │   ├── incidents/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── IncidentCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── lib/                  # Utilities and API client
│   │   │   ├── api.ts
│   │   │   └── useAuth.ts
│   │   └── hooks/                # Custom React hooks
│   │       └── useAuth.ts        # (symlink or copy from lib)
│   └── .env.local.example
│
└── docs/                         # Documentation
    └── ARCHITECTURE.md           # Detailed architecture guide
```

> **Note:** Frontend source remains at project root for Next.js compatibility. The `frontend/` path in the tree represents the logical grouping.

---

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 6. Start the server
python main.py
# or
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

### Frontend Setup

```bash
# 1. Install dependencies (from project root)
npm install

# 2. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your backend API URL

# 3. Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### Default Credentials

| Username | Password |
|----------|----------|
| admin    | admin123 |

> Change the default password in production by updating `ADMIN_PASSWORD_HASH` in your `.env` file. Generate a new hash using:
> ```python
> from passlib.context import CryptContext
> ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
> print(ctx.hash("your-new-password"))
> ```

---

## Environment Variables

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | — | JWT signing key (use a strong random string) |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Token expiration time |
| `ADMIN_USERNAME` | No | `admin` | Admin username |
| `ADMIN_PASSWORD_HASH` | Yes | — | bcrypt hash of admin password |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin |
| `OPENROUTER_API_KEY` | No | — | OpenRouter API key for AI analysis |
| `PORT` | No | `8000` | Server port |

### Frontend (.env.local)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | — | Backend API base URL |

---

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure build and start commands:
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn api.app:app --host 0.0.0.0 --port $PORT`
4. Set environment variables in Render dashboard:
   - `SECRET_KEY` (generate a strong random string)
   - `ADMIN_PASSWORD_HASH` (bcrypt hash of your admin password)
   - `OPENROUTER_API_KEY` (optional, for AI analysis)
   - `FRONTEND_URL` (your Vercel frontend URL)
5. Set root directory to `backend`

### Frontend (Vercel)

1. Import your repository into Vercel
2. Configure build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` (your Render backend URL)
4. Deploy

### Post-Deployment Checklist

- Verify CORS allows your frontend domain
- Test login with admin credentials
- Confirm API health endpoint responds
- Validate that `.env` files are not in the repository
- Test incident creation and dashboard display

---

## Future Improvements

### Security
- Implement role-based access control (RBAC) at the API middleware level
- Add rate limiting to login and API endpoints
- Implement refresh token rotation for longer sessions
- Add audit logging for all admin actions
- Replace JSON file storage with PostgreSQL or MongoDB
- Add HTTPS enforcement and security headers

### Detection
- Integrate with real SIEM sources (Wazuh API, Elastic SIEM, Splunk)
- Add more detection rules (SQL injection, XSS, DDoS patterns)
- Implement anomaly detection with statistical models
- Add threat intelligence feed integration (MITRE ATT&CK mapping)

### Platform
- WebSocket support for real-time incident streaming
- Email/Slack notifications for critical incidents
- Incident assignment and team collaboration features
- Export reports as PDF
- Dark/light theme toggle
- Mobile-responsive dashboard improvements

### DevOps
- Docker containerization with docker-compose
- CI/CD pipeline with automated testing
- Health check endpoints for monitoring
- Structured logging with correlation IDs
- API versioning strategy

---

## Key Learnings

- **Security Engineering:** Implemented bcrypt password hashing, JWT authentication, CORS configuration, input validation, and XSS prevention across a full-stack application
- **Threat Detection Pipeline:** Built a modular detection system with rule-based classification, optional AI enhancement, and automatic incident correlation
- **API Design:** Designed a RESTful API with proper error handling, request validation via Pydantic, and middleware-based authentication
- **Real-Time Systems:** Implemented file-based log streaming with JSONL parsing and automatic incident updates
- **Full-Stack Integration:** Connected a Next.js frontend with a FastAPI backend, managing authentication flow and real-time data synchronization
- **Production Readiness:** Structured the project for deployment on Render and Vercel with environment-based configuration

---

## Project Status

| Area | Status |
|------|--------|
| Core Detection Pipeline | Complete |
| Incident Management | Complete |
| REST API | Complete |
| JWT Authentication | Complete |
| Dashboard UI | Complete |
| AI Analysis (Optional) | Complete |
| Password Security (bcrypt) | Complete |
| Environment Configuration | Complete |
| Role-Based Access Control | Documented (implementation pending) |
| Database (PostgreSQL/MongoDB) | Planned |
| Real-Time WebSocket | Planned |
| CI/CD Pipeline | Planned |

**Current Version:** 1.0.0
**Last Updated:** 2026-05-04

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
