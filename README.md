<div align="center">

```
 ██████╗██╗      ██████╗ ███████╗███████╗██╗      ██████╗  ██████╗ ██████╗
██╔════╝██║     ██╔═══██╗██╔════╝██╔════╝██║     ██╔═══██╗██╔═══██╗██╔══██╗
██║     ██║     ██║   ██║███████╗█████╗  ██║     ██║   ██║██║   ██║██████╔╝
██║     ██║     ██║   ██║╚════██║██╔══╝  ██║     ██║   ██║██║   ██║██╔═══╝
╚██████╗███████╗╚██████╔╝███████║███████╗███████╗╚██████╔╝╚██████╔╝██║
 ╚═════╝╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝
```

### *AI that goes beyond insights — it completes your sales workflow.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_v0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Supabase](https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/AI-Gemini_3_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Resend](https://img.shields.io/badge/Email-Resend-EA4335?style=flat-square)](https://resend.com)
[![Tests](https://img.shields.io/badge/Tests-26%2F26_passing-10B981?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-F97316?style=flat-square)](./LICENSE)

</div>

---

## Table of Contents

- [Why CloseLoop?](#why-closeloop)
- [UI Preview](#ui-preview)
- [Architecture](#architecture)
- [Features](#features)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Testing](#testing)
- [Service Status](#service-status)
- [Demo Credentials](#demo-credentials)
- [Docker](#docker)
- [Cloud Deployment](#cloud-deployment)
- [Backlog](#backlog)
- [License](#license)

---

## Why CloseLoop?

Sales tools analyze calls.
**CloseLoop turns those insights into action.**

No more copying notes into HubSpot.
No more rewriting follow-up emails from scratch.
No more manual task creation after every call.

Paste a transcript. Review what the AI built. Hit approve.
The email goes out, the CRM is updated, the tasks are assigned.
That's the loop — and CloseLoop closes it.

---

## UI Preview

**Call Review — The Hero Interface**

<p align="center">
  <img src="https://i.ibb.co/1tcPsSc6/Screenshot-2026-03-13-050211.png" width="780" alt="CloseLoop Call Review" />
</p>

**Dashboard — Execution Queue**

<p align="center">
  <img src="https://i.ibb.co/B5sRjtYZ/Screenshot-2026-03-13-045958.png" width="780" alt="CloseLoop Dashboard" />
</p>

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLOSELOOP v2                           │
├─────────────────┬──────────────────┬───────────────────────────┤
│    Frontend     │     Backend      │        Services            │
│                 │                  │                            │
│  React 18       │  FastAPI 0.110   │  Gemini 3 Flash  (AI)     │
│  React Router   │  Motor (async)   │  Supabase Auth   (real)   │
│  Tailwind CSS   │  Pydantic v2     │  Resend API      (real)   │
│  shadcn/ui      │  uvicorn         │  MongoDB         (data)   │
│  Radix UI       │                  │                            │
│  Recharts       │  Port: 8000      │  HubSpot         (mocked) │
│  Lucide React   │  Docs: /docs     │  Transcription   (mocked) │
│                 │                  │                            │
│  Port: 3000     │                  │                            │
└─────────────────┴──────────────────┴───────────────────────────┘
```

---

## Features

### ⚡ AI Execution Engine
After a transcript is submitted, Gemini 3 Flash generates four ready-to-approve outputs in one shot: a follow-up email draft, categorized CRM notes, a prioritized task list with assignees and due dates, and timestamped key moments from the call.

### 🖥️ Call Review — The Hero Interface
A purpose-built split-screen workspace: **40% call context** on the left (transcript, contact info, key moments), **60% execution items** on the right (email, CRM notes, tasks). Each item is individually editable and approvable, or everything ships with a single "Approve All." Approved emails fire via Resend immediately.

### 🗄️ Data Vault
Superadmins upload contextual documents — pricing sheets, SOC2 certs, case studies — and tag them with trigger words. When a transcript mentions a trigger word, CloseLoop automatically surfaces and attaches the right document to the AI-generated email.

### 👥 Role-Based Access

| Role | Capabilities |
|---|---|
| `Superuser` | Platform admin — manage all workspaces, create companies and superusers, view platform-wide stats |
| `Superadmin` | Company admin — manage team members, control the Data Vault, review rep performance |
| `Rep` | Review and approve AI-generated call outputs; manage own tasks and settings |

### 📧 Real Email Delivery
Integrated with Resend. Approved follow-up emails go out immediately — no copy-paste, no context switching.

---

## API Reference

Full interactive docs available at `http://localhost:8000/docs` (Swagger) and `http://localhost:8000/redoc`.

```
/api/auth         signup · login · /me · forgot-password
/api/calls        CRUD · upload transcript · approve item · approve all
/api/tasks        list · update · delete
/api/vault        CRUD · toggle active (admin only)
/api/admin        team management · workspace settings · performance metrics
/api/platform     workspaces · superusers · stats · setup (superuser only)
/api/user         stats · notifications · onboarding · profile
```

---

## Project Structure

```
closeloop/
├── backend/
│   ├── server.py                      # All FastAPI routes, models, business logic
│   ├── requirements.txt               # Python dependencies
│   ├── .env                           # Environment variables (not committed)
│   └── tests/
│       ├── test_closeloop_api.py      # API integration tests (26 tests, 100% pass)
│       └── test_supabase_auth.py      # Auth-specific tests
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── CallReviewPage.jsx     # THE HERO — split-screen call execution
│       │   ├── Dashboard.jsx          # Execution queue and rep overview
│       │   ├── CallsPage.jsx          # Call list and management
│       │   ├── CustomersPage.jsx      # Contact management
│       │   ├── SettingsPage.jsx       # User profile and notifications
│       │   ├── OnboardingPage.jsx     # 4-step onboarding wizard
│       │   └── admin/
│       │       ├── TeamPage.jsx       # Team management (superadmin)
│       │       ├── VaultPage.jsx      # Data Vault management (superadmin)
│       │       ├── PlatformPage.jsx   # Workspace management (superuser)
│       │       └── AdminSettingsPage.jsx
│       ├── context/AuthContext.js     # Supabase auth state
│       └── lib/api.js                 # Typed API client
│
├── memory/PRD.md                      # Full product requirements document
├── design_guidelines.json            # Brand identity, color system, component specs
├── test_reports/                      # Pytest XML results and iteration logs
└── test_result.md                     # Live test state (main ↔ testing agent protocol)
```

---

## Quick Start

> **Prerequisites:** Node.js v18+, Python 3.9+, MongoDB running at `mongodb://localhost:27017`

### 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

Create `backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="closeloop"
CORS_ORIGINS="*"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
RESEND_API_KEY="your-resend-api-key"
SENDER_EMAIL="onboarding@resend.dev"
EMERGENT_LLM_KEY="your-gemini-key"
```

```bash
uvicorn server:app --reload
```

→ API: `http://localhost:8000`
→ Swagger: `http://localhost:8000/docs`
→ ReDoc: `http://localhost:8000/redoc`

---

### 2 — Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000
```

```bash
npm start
```

→ App: `http://localhost:3000`

---

## Testing

```bash
cd backend
source venv/bin/activate

# Full test suite (26 tests — auth, calls, vault, tasks, approval workflow)
python -m pytest tests/

# Root-level shortcut
python backend_test.py
```

Coverage: authentication, full calls CRUD, Data Vault CRUD, approval workflow (individual + bulk), task management, and role-based access control.

---

## Service Status

| Service | Status | Notes |
|---|---|---|
| Authentication | ✅ Real | Supabase Auth (email/password) |
| Email Sending | ✅ Real | Resend API — fires on approval |
| AI Generation | ✅ Real | Gemini 3 Flash |
| HubSpot CRM | 🟡 Mocked | Simulated in UI |
| Transcription | 🟡 Mocked | Manual paste in current version |
| Billing | ⬜ Not started | Stripe placeholder |
| Calendar | ⬜ Not started | Placeholder |

---

## Demo Credentials

For local testing only:

```
Superuser    →  superadmin@closeloop.io    /  SuperPass123!
Superadmin   →  sarah@technova.io          /  ClientPass123!
Superadmin   →  demo_user@testdemo.com     /  DemoPass123!
```

---

## Docker

```yaml
# docker-compose.yml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  mongo:
    image: mongo:6
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

```bash
docker-compose up --build
```

---

## Cloud Deployment

**Backend — Railway** *(recommended)*
Deploy backend service → add environment variables → add MongoDB plugin

**Backend — Render**
Build: `pip install -r requirements.txt`
Start: `uvicorn server:app --host 0.0.0.0 --port 8000`

**Frontend — Netlify / Vercel**
Build: `npm run build` · Publish: `build/` · Env: `REACT_APP_API_URL=<backend_url>`

---

## Backlog

**P0 — Critical**
- HubSpot OAuth for real CRM sync
- Audio transcription via Whisper API
- Custom sender domain

**P1 — High**
- Zoom / Google Meet auto-recording integration
- Stripe billing
- Advanced team analytics

**P2 — Medium**
- Bulk call import
- Custom email templates
- File upload for Data Vault documents

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Built to close loops, not open tickets.

</div>
