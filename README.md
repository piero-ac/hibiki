# Hibiki

> AI-powered Japanese shadowing application built with Next.js, Supabase, and OpenAI Whisper.

**Demo Video**:https://youtu.be/H70_k8iyBIY
**Project Link:** https://hibiki-mu.vercel.app/

Hibiki helps advanced Japanese learners improve their pronunciation through shadowing. Users practice curated N2 and N1 sentences, record their voice, receive AI-powered transcription feedback, and track their progress over time.

---

## Features

- 🎤 Record Japanese shadowing attempts
- 🤖 AI-powered pronunciation grading using OpenAI Whisper
- 📚 Curated N2 and N1 sentence library
- 🎲 Random sentence practice
- 📈 Progress dashboard with practice analytics
- 🏆 Strongest and weakest sentence tracking
- 📝 Previous attempt history per sentence
- 🔐 Secure authentication with Supabase Auth
- 🎭 Demo mode with seeded practice data
- 📱 Fully responsive design

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend

- Next.js Server Actions
- Supabase
- PostgreSQL
- Row Level Security (RLS)

### AI

- OpenAI Whisper

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/piero-ac/hibiki.git

cd hibiki
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

OPENAI_API_KEY=

DEMO_USER_EMAIL=
DEMO_USER_PASSWORD=
```

### Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Demo Mode

Hibiki includes a shared demo account for exploring the application without creating an account.

Demo users can:

- Browse the sentence library
- Practice any sentence
- Record and play back audio
- Explore the dashboard
- View progress analytics
- Review previous attempts

To prevent abuse of the OpenAI API, AI pronunciation grading is disabled in demo mode.

---

## Generate Supabase Types

After updating your database schema, regenerate the TypeScript types:

```bash
npm run update-types
```

---

## Project Structure

```
src/
├── app/
│   ├── auth/
│   └── protected/
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
├── types/
└── utils/
```

---

## Architecture

Hibiki follows a server-first architecture using the Next.js App Router.

- Server Components fetch application data
- Server Actions handle authentication and pronunciation grading
- Supabase manages authentication and PostgreSQL data
- OpenAI Whisper performs speech transcription
- PostgreSQL views power dashboard analytics

---

## Roadmap

- [ ] Admin panel for sentence management
- [ ] Supabase database migrations
- [ ] Improved pronunciation scoring algorithm
- [ ] Progress charts and visualizations
- [ ] User settings
- [ ] Docker support

---

## License

This project is licensed under the MIT License.
