# JobPulse AI

## Job Market Intelligence & Career Analytics Platform

**Understand the job market. Measure your skills. Build your career.**

JobPulse AI is a production-oriented MERN SaaS application that combines job discovery, market analytics, skill intelligence, deterministic job matching, resume analysis, career-gap analysis, roadmaps, and AI-powered explanations.

## Core Philosophy

This is NOT an AI chatbot.

The core application works through:
- MongoDB
- search
- analytics
- deterministic scoring
- market calculations
- application workflows
- alerts
- normal web application logic

AI is used for:
- semantic document understanding
- explanations
- personalization
- natural-language search parsing
- roadmap assistance

If the AI provider is unavailable, the main product remains functional.

## Stack

### Frontend
React + TypeScript + Vite + Tailwind + TanStack Query

### Backend
Node.js + Express + TypeScript + Mongoose

### Database
MongoDB

### Background jobs
Redis + BullMQ

### AI
Provider abstraction + structured output validation

### Testing
Vitest + Supertest + React Testing Library + Playwright

### Deployment

## Quick Start

1. Install Node.js 20+.
2. Install a consistent package manager.
3. Copy `.env.example` to `.env`.
4. Configure MongoDB and Redis.
5. Configure GitHub OAuth if authentication is enabled.
6. Configure AI provider credentials if AI features are enabled.
7. Install dependencies.
9. Seed the synthetic demo dataset.
10. Start web, API and worker.

Exact commands must be documented by the implementation after scaffolding.

## Demo Data

The project must ship with a synthetic dataset.

Synthetic records must be visibly labeled.

Never present synthetic records as live job listings.

## Security

Read `docs/security.md`.

Important:
- uploaded resumes are untrusted
- job descriptions are untrusted
- AI output is untrusted until validated
- all authorization is server-side
- secrets stay server-side

## Antigravity

Before coding, the agent must read:
- `requirements.md`
- `modules.md`
- `architecture.md`

Those documents are the source of truth.

Do not simplify the project into a demo.

## Expected Result

A user should be able to:

Discover jobs
→ understand market trends
→ inspect required skills
→ create a career profile
→ measure job fit
→ identify skill gaps
→ analyze a resume
→ generate a roadmap
→ save/apply to jobs
→ track applications
→ receive alerts
→ monitor how the market changes

The finished application should feel like a coherent SaaS product rather than a collection of disconnected student-project pages.
