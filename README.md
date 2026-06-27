# Hibiki

Hibiki is a full-stack Japanese shadowing application built with Next.js and Supabase.

Users practice Japanese pronunciation by recording themselves, comparing their speech with target sentences, and tracking their progress over time.

---

## Features

- Authentication
- Japanese sentence practice
- Whisper speech transcription
- Pronunciation scoring
- Progress dashboard
- Responsive UI
- Server-first architecture

---

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PostgreSQL
- OpenAI Whisper

---

## Getting Started

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Open:

http://localhost:3000

---

## Generate Supabase Types

```bash
npm run update-types
```

---

## Project Structure

```
src/
├── app/
├── components/
│   ├── app/
│   └── ui/
├── lib/
├── types/
└── utils/
```

---

## Development Workflow

1. Create a feature branch.
2. Build the feature.
3. Open a pull request.
4. Merge into `main`.
5. Sync local `main`.

---

## Roadmap

- Navigation redesign
- Database migrations
- Progress charts
- Sentence management
- Admin panel
- Deployment
