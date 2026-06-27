# Hibiki Design Document

## Overview

Hibiki is a Japanese shadowing application focused on improving pronunciation through speech recognition and structured practice.

The project follows a server-first architecture using Next.js App Router and Supabase.

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Supabase Auth
- PostgreSQL
- Storage
- Row Level Security (RLS)

### AI

- OpenAI Whisper

---

## Architecture

Next.js (Server Components)
│
▼
Server Actions / Route Handlers
│
▼
Supabase
├── Auth
├── PostgreSQL
├── Storage
└── Views

---

## Design Principles

- Server-first rendering
- Type-safe database access
- Mobile-first responsive UI
- Reusable UI components
- Keep business logic on the server
- Use SQL views for read-heavy dashboards

---

## UI Foundation

Reusable application components:

- PageContainer
- PageHeader
- SectionHeader
- StatCard
- EmptyState
- AppNavbar (planned)

Built on top of shadcn/ui.

---

## Current Features

### Authentication

- User sign up
- User login
- Protected routes

### Practice

- Shadowing workflow
- Whisper transcription
- Accuracy scoring

### Progress

- Overview statistics
- Recent attempts
- Strongest / weakest sentences

---

## Planned Features

- Navigation redesign
- Sentence search
- Dashboard improvements
- Admin panel
- Progress charts
- Audio player improvements

---

## Database

Current database objects:

### Tables

- users
- sentences
- attempts

### Views

- attempts_summary
- recent_attempts
- sentence_progress

Future schema changes should be managed through Supabase migrations.
