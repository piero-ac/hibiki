---
name: deploy-db
description: Push pending Supabase migrations to the linked remote project, then regenerate database types.
disable-model-invocation: true
---

Ship the **pending** migrations (committed in `supabase/migrations/`, not yet on the remote) to the remote Supabase project. The remote is production: nothing touches it until the user says go in step 4.

## 1. Preflight

- `git status` is clean and the migrations are committed. Pushing uncommitted SQL creates drift no one can reproduce.
- The link points at the project the types come from: `supabase/.temp/project-ref` matches the `--project-id` in the `update-types` script in `package.json`. If they differ, stop and ask.
- `npx supabase migration list --linked` lists the pending migrations (an empty remote column). If there are none, skip to step 6.
- If a migration shows on the remote but not locally, stop. The remote has drifted, and pushing on top of it is the user's call.

Done when you have the pending list and every check passed.

## 2. Prove it locally

Run `npm run db:reset-dev`, then `npx supabase test db`. Both must be green. A migration that fails on a fresh local database will fail on the remote too.

## 3. Preview and assess

Run `npx supabase db push --dry-run`. Then read every pending migration and list what could break or be lost on real data:

- `set not null`, `check`, and `unique` constraints fail the push if existing remote rows violate them. Name the column and the condition.
- `drop column` and `drop table` destroy remote data permanently.
- Renames break any deployed app code that still uses the old name.

Done when every pending migration is accounted for, either with its risk or marked "no data risk".

## 4. Confirm

Show the user the pending list and the step 3 risks, then ask for an explicit go-ahead to push to production. Wait for it. Approval from an earlier run doesn't carry over.

## 5. Push

Run `npx supabase db push`. If it asks for the database password, have the user run `! npx supabase db push` themselves. If it fails partway, report the exact error and the migration it failed on. Then stop: retrying blind can leave the schema half-applied.

## 6. Verify and regenerate types

- `npx supabase migration list --linked`: every local migration now has a remote version.
- `npm run update-types`, then `npx prettier --write src/types/database.types.ts`, because the generator's output isn't Prettier-formatted.
- `npm run typecheck`.
- If the types changed, commit them as `chore(types): regenerate database types`. An empty diff is the expected outcome when the types were already regenerated locally alongside the migrations.

## 7. Report

Report which migrations were applied, whether the types changed, and a reminder to deploy the app (Vercel) **after** the database. The new code may depend on the new schema.
