# Hibiki Design Document

## Overview

Hibiki is a full-stack Japanese shadowing application designed to help advanced learners improve pronunciation through structured speaking practice.

The application follows a server-first architecture using the Next.js App Router. Business logic, authentication, and database access are handled on the server, while client components are reserved for interactive experiences such as audio recording and playback.

---

# Goals

- Build a production-quality portfolio project
- Practice modern full-stack development with Next.js
- Minimize client-side complexity
- Keep business logic secure on the server
- Maintain a reusable component architecture
- Design for future scalability

---

# Tech Stack

## Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## Backend

- Next.js Server Actions
- Supabase Auth
- PostgreSQL
- Supabase Storage
- Row Level Security (RLS)

## AI

- OpenAI Whisper

---

# High-Level Architecture

```
Browser
    │
    ▼
React Client Components
    │
    ▼
Next.js Server Components
    │
    ▼
Server Actions
    │
    ▼
Supabase
├── Authentication
├── PostgreSQL
├── Storage
└── SQL Views
```

---

# Design Principles

## Server-first

Data fetching occurs inside Server Components whenever possible.

Benefits:

- Less client JavaScript
- Faster initial rendering
- Better security
- Simpler data flow

---

## Thin Client Components

Client Components exist only when browser APIs are required.

Examples:

- Audio recording
- Audio playback
- Timers
- Form interactions

Business logic remains on the server.

---

## Reusable UI

Common layouts and repeated UI patterns are extracted into reusable components.

Examples:

- PageContainer
- AppNavbar
- ProgressOverview
- PreviousAttemptsCard
- SentenceCard
- ActionCard

The design system is built on top of shadcn/ui.

---

## SQL-first Analytics

Instead of calculating dashboard statistics inside React, PostgreSQL views generate aggregated data.

Current views:

- attempts_summary
- recent_attempts
- sentence_progress

Benefits:

- Less application code
- Faster reads
- Simpler page components

---

# Application Structure

```
src/
├── app/
│   ├── auth/
│   ├── protected/
│
├── components/
│   ├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   ├── practice/
│   ├── progress/
│   ├── sentences/
│   └── ui/
│
├── lib/
│   ├── supabase/
│   ├── scoring.ts
│   └── demo.ts
│   └── utils.ts
│
├── types/
└── utils/
```

---

# Authentication

Authentication is handled by Supabase Auth.

Protected routes verify the authenticated user before rendering application content.

A shared demo account provides a read-only experience without consuming OpenAI API credits.

---

# Pronunciation Pipeline

```
Record Audio
        │
        ▼
Client Component
        │
        ▼
Server Action
        │
        ▼
OpenAI Whisper
        │
        ▼
Similarity Scoring
        │
        ▼
Save Attempt
        │
        ▼
Dashboard Updates
```

Demo users bypass the Whisper step and cannot submit grading requests.

---

# Database

## Tables

- users
- sentences
- attempts

## Views

- attempts_summary
- recent_attempts
- sentence_progress

Database schema changes should be managed using Supabase migrations.

---

# Future Improvements

## Short Term

- Admin sentence management
- Supabase migrations
- Improved pronunciation scoring
- Better loading states

## Long Term

- User settings
- Progress charts
- Sentence search and filtering
- Audio waveform visualization
- Docker support
- CI/CD pipeline
