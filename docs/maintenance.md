# Hibiki Maintenance

## Database

- [x] Version-control the schema with Supabase CLI migrations
- [x] Commit the initial schema migration
- [x] Configure local Supabase development
- [x] Add repeatable local database seeding
- [ ] Review indexes for attempts and progress queries
- [ ] Analyze slow queries as production usage grows

## Security

- [x] Add database tests for RLS policies
- [x] Add database tests for the new-user profile trigger
- [x] Add database tests for storage policies
- [ ] Run database tests in CI
- [ ] Add server-side audio file size and MIME type validation
- [ ] Add rate limiting to AI grading requests
- [ ] Review API keys

## Application Quality

- [ ] Add unit tests for pronunciation scoring and text normalization
- [ ] Add integration tests for authentication and pronunciation grading
- [ ] Add end-to-end tests for core practice flows
- [ ] Add lint, formatting, build, and test checks to CI

## Cleanup

- [ ] Remove unused UI components and exports
- [x] Add a committed `.env.example`
- [ ] Consolidate duplicated environment-variable validation
- [ ] Make production builds independent of downloading Google Fonts
