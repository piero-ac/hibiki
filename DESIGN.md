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
- shadcn/ui on the rounded `radix-maia` style, themed with the Claude Design "Organic" look (mockups and design system in `docs/design/ui/`). The look lives in theme tokens in `src/app/globals.css`, not in forked components (ADR 0002). Light only.
- Organic fonts through `next/font/google`: Caprasimo (headings), Figtree (body) and Zen Maru Gothic (Japanese text)
- Lucide icons at stroke-width 2.75

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

The UI is built from shadcn/ui components themed through tokens (ADR 0002). shadcn components in use (`src/components/ui/`): Accordion, AlertDialog, Badge, Button, Card, Drawer, Empty, Field, Input, Label, Progress, Select, Separator, Skeleton, Toggle and ToggleGroup.

The only custom compositions are the Step trail and the Sentence block (`src/components/lesson-player/`). Other shared pieces are plain compositions of shadcn parts:

- AppNavbar and AppTabBar (header nav on desktop, bottom tab bar on phones)
- LessonTags (JLPT Level and Category Badges)
- LessonPlayer and LessonExit (every player exit confirms before leaving)
- UpNextCard and LessonStatusGrid (Home)
- LessonPicker (Lessons)
- ProgressOverview, RecentActivity and NoActivityYet (Progress)

---

## SQL-first Analytics

Instead of calculating dashboard statistics inside React, PostgreSQL views generate aggregated data.

Current views:

- shadowing_activity_summary (Activity)
- recent_shadowing_attempts (Activity)
- ai_grading_attempts_summary (Scores)
- recent_ai_grading_attempts (Scores)
- ai_grading_sentence_progress (Scores)

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
│   └── protected/
│       ├── (app)/       # Home, Lessons, Progress: navbar + tab bar
│       └── (lesson)/    # Lesson player at /protected/sentences/[id]
│
├── components/
│   ├── app/             # AppNavbar, AppTabBar
│   ├── auth/
│   ├── home/            # UpNextCard, LessonStatusGrid
│   ├── lesson-player/   # LessonPlayer, Step trail, Sentence block
│   ├── progress/
│   ├── sentences/       # LessonPicker, LessonTags
│   └── ui/              # shadcn components (radix-maia)
│
├── lib/
│   ├── app-nav/
│   ├── auth/
│   ├── lesson-catalogue/
│   ├── lesson-player/
│   ├── progress/
│   ├── supabase/
│   ├── scoring.ts
│   └── utils.ts
│
└── types/
```

---

# Authentication

Authentication is handled by Supabase Auth.

Protected routes verify the authenticated user before rendering application content.

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

---

# Database

## Tables

- profiles
- sentences
- shadowing_attempts
- ai_grading_attempts

## Views

- shadowing_activity_summary (Activity)
- recent_shadowing_attempts (Activity)
- ai_grading_attempts_summary (Scores)
- recent_ai_grading_attempts (Scores)
- ai_grading_sentence_progress (Scores)

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
