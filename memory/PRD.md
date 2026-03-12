# CloseLoop - Product Requirements Document

## Overview
CloseLoop is an execution-first B2B SaaS web application for sales teams.
Tagline: "We don't only analyze calls. We execute them."

**Last Updated:** March 12, 2026
**Status:** V2 - Supabase Auth + Resend + Role Hierarchy

---

## Architecture

### Tech Stack
- **Frontend:** React 18, React Router, Tailwind CSS, Shadcn/UI, @supabase/supabase-js
- **Backend:** FastAPI (Python) with Motor (async MongoDB)
- **Database:** MongoDB (all app data + user profiles)
- **Authentication:** Supabase Auth (email/password), backend-proxied
- **AI/LLM:** Gemini 3 Flash via Emergent Universal Key
- **Email:** Resend API (real transactional emails)

### Role Hierarchy
1. **Superuser** - Platform admin, manages multiple companies, no workspace_id
2. **Superadmin** - Company admin, controls Data Vault, manages team, sees performance
3. **Rep** - Sales representative, reviews/approves call outputs

### Key Files
- `/app/backend/server.py` - Main API server
- `/app/frontend/src/context/AuthContext.js` - Supabase-based auth
- `/app/frontend/src/pages/CallReviewPage.jsx` - THE HERO page
- `/app/frontend/src/pages/admin/PlatformPage.jsx` - Superuser management
- `/app/frontend/src/pages/OnboardingPage.jsx` - User onboarding
- `/app/frontend/src/lib/api.js` - API client

---

## What's Been Implemented

### March 12, 2026 - V2 Major Update
- [x] Supabase Auth integration (replaces JWT)
- [x] Resend email integration (real follow-up emails sent on approval)
- [x] Role hierarchy: superuser > superadmin > rep
- [x] Platform management page (superuser-only): manage workspaces, create superusers, platform stats
- [x] Create workspace flow: superuser creates company + admin account
- [x] Enhanced AI email generation: shorter, selective document attachment
- [x] User onboarding flow (4-step wizard)
- [x] Real notification settings (persisted to MongoDB)
- [x] Team performance metrics endpoint
- [x] POST /api/platform/setup for first superuser creation
- [x] Role-based access control (403 for unauthorized access)
- [x] Testing: 100% backend (26/26), 100% frontend flows

### March 12, 2026 - Core AI Enhancement
- [x] AI generates all 4 outputs: email, CRM notes, tasks, key moments
- [x] Categorized CRM notes with color-coded categories
- [x] Post-call task list with priorities/assignees/due dates
- [x] Data Vault document matching via trigger words
- [x] Approval workflow for all item types including tasks

### January 26, 2026 - V1 MVP
- [x] Complete public website (Landing, Pricing, Product, etc.)
- [x] Dashboard with execution queue
- [x] Call CRUD and AI processing
- [x] Call Review "HERO" page with split-screen layout
- [x] Data Vault management
- [x] Team management basics

---

## Core Requirements (Static)

### Authentication (Supabase)
- [x] Email/password signup via Supabase Admin API
- [x] Login via Supabase sign_in_with_password
- [x] Token verification via supabase_admin.auth.get_user
- [x] Password reset via Supabase
- [x] Role-based access control (superuser/superadmin/rep)

### Platform Management (Superuser)
- [x] List all workspaces with stats
- [x] Create new workspace + admin (Supabase user + MongoDB profile)
- [x] Create additional superusers
- [x] Platform-wide statistics
- [x] Initial setup endpoint (first superuser)

### Company Administration (Superadmin)
- [x] Data Vault: add/edit/delete/toggle documents
- [x] Team Management: invite/remove/role change
- [x] Team Performance: calls, approval rates per rep
- [x] Workspace Settings

### Call Review (THE HERO)
- [x] Split-screen: context (40%) + execution (60%)
- [x] Email draft with selective document references
- [x] CRM updates with categorized Call Insights
- [x] Post-call tasks with priorities/due dates
- [x] Individual edit/approve per section
- [x] Approve All button
- [x] Real email sending on approval (Resend)

### User Experience
- [x] Onboarding wizard (4 steps)
- [x] Notification settings (persisted)
- [x] Profile management

---

## Mocked vs Real Services

| Service | Status | Details |
|---------|--------|---------|
| Authentication | REAL | Supabase Auth |
| Email Sending | REAL | Resend API (onboarding@resend.dev) |
| AI Generation | REAL | Gemini 3 Flash via Emergent LLM Key |
| CRM (HubSpot) | MOCKED | Simulated in UI |
| Transcription | MOCKED | Manual paste |
| Calendar | NOT STARTED | Placeholder |
| Billing | NOT STARTED | Placeholder |

---

## Prioritized Backlog

### P0 - Critical
- [ ] HubSpot OAuth integration for real CRM updates
- [ ] Audio transcription (Whisper API)
- [ ] Custom email domain (instead of onboarding@resend.dev)

### P1 - High Priority
- [ ] Zoom/Google Meet integration for auto-recording
- [ ] Stripe payment integration
- [ ] Advanced team analytics dashboard

### P2 - Medium Priority
- [ ] Bulk call import
- [ ] Custom email templates
- [ ] Advanced CRM field mapping
- [ ] File upload for Data Vault documents

### P3 - Nice to Have
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] SSO (Enterprise)
- [ ] Custom branding per workspace

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Superuser | superadmin@closeloop.io | SuperPass123! |
| Superadmin | sarah@technova.io | ClientPass123! |
| Superadmin | demo_user@testdemo.com | DemoPass123! |
