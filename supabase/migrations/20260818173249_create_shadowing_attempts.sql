create table public.shadowing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles (id)
    on delete cascade,
  sentence_id uuid not null
    references public.sentences (id)
    on delete cascade,
  completed_at timestamp with time zone not null
    default timezone('utc'::text, now())
);

comment on table public.shadowing_attempts is
  'Records completed shadowing lessons for authenticated users.';

comment on column public.shadowing_attempts.completed_at is
  'The time at which the user completed the shadowing lesson.';

create index shadowing_attempts_user_completed_at_idx
on public.shadowing_attempts (user_id, completed_at desc);

create index shadowing_attempts_user_sentence_idx
on public.shadowing_attempts (user_id, sentence_id);

create index shadowing_attempts_sentence_id_idx
on public.shadowing_attempts (sentence_id);

alter table public.shadowing_attempts enable row level security;

revoke all on table public.shadowing_attempts from anon;
revoke all on table public.shadowing_attempts from authenticated;

grant select, insert on table public.shadowing_attempts to authenticated;
grant all on table public.shadowing_attempts to service_role;

create policy "Users can read their own shadowing attempts"
on public.shadowing_attempts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own shadowing attempts"
on public.shadowing_attempts
for insert
to authenticated
with check ((select auth.uid()) = user_id);
