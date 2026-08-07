# Hibiki Maintenance and Product Roadmap

This is a living backlog for taking Hibiki from a private project to a tested,
deployable product. Timing is directional and can shift around work on Tomowa.

## Recently Completed

- [x] Version-control the database schema with Supabase CLI migrations
- [x] Configure local Supabase development and repeatable seed data
- [x] Add database tests for RLS policies, storage policies, and profile creation
- [x] Add a committed `.env.example`
- [x] Remove unused UI component files
- [x] Add Knip for unused-code checks
- [x] Reject missing, empty, oversized, and unsupported audio uploads server-side

## Current Focus

- [x] Add focused tests for audio upload validation
- [x] Consolidate duplicated environment-variable validation
- [x] Make production builds independent of downloading Google Fonts
- [ ] Review dependency updates and keep the lockfile current

## August Product Readiness

### Testing Foundation

- [x] Add unit tests for pronunciation scoring and Japanese text normalization
- [ ] Add integration tests for authentication and pronunciation grading
- [ ] Run existing Supabase database tests automatically
- [ ] Add reusable test fixtures for users, sentences, attempts, and audio uploads

### Security and Cost Controls

- [x] Parse uploaded audio server-side to verify its format and duration
- [x] Reject corrupt audio and recordings exceeding the duration limit
- [ ] Add per-user and per-IP rate limiting to AI grading requests
- [ ] Add grading timeouts, usage limits, and OpenAI failure handling
- [ ] Review and rotate production API keys before a public launch
- [ ] Review authentication redirects, session handling, and demo-account access

### CI/CD

- [x] Run lint, formatting, Knip, builds, and tests on every pull request
- [ ] Add a staging environment for migration and release verification
- [ ] Add an automated production deployment pipeline
- [ ] Document environment configuration, database migration order, and rollback steps
- [ ] Add post-deployment smoke tests for authentication and practice flows

### Database and Performance

- [ ] Review indexes for attempts, recent activity, and sentence progress queries
- [ ] Add pagination before sentence and attempt collections grow
- [ ] Inspect query plans for the progress views
- [ ] Establish production error and slow-query monitoring

### User Experience and Reliability

- [ ] Add cancel and manual-stop recording controls
- [ ] Improve microphone permission, playback, and grading error messages
- [ ] Ensure recording streams and timers are cleaned up during navigation
- [ ] Add accessible announcements for countdown, recording, and grading states
- [ ] Replace plain error text with consistent error states and retry actions
- [ ] Add end-to-end tests for login, practice, grading, and progress

## After Product Readiness

- [ ] Improve pronunciation scoring with kana- or mora-aware feedback
- [ ] Highlight missing, extra, and mismatched portions of a transcription
- [ ] Add score trends, practice streaks, and progress visualizations
- [ ] Add sentence search, filtering, sorting, favorites, and practice queues
- [ ] Add user settings, data export, and account deletion
- [ ] Add an admin workflow for sentence management and importing content
- [ ] Add full-application Docker support if it improves deployment or onboarding

## Ongoing Maintenance

- [ ] Audit dependencies and security advisories regularly
- [ ] Review RLS policies whenever database access patterns change
- [ ] Analyze production errors, slow queries, and AI usage
- [ ] Keep migrations, generated database types, documentation, and tests synchronized
