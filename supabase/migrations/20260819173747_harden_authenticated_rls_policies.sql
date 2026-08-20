alter policy "Users can create their own AI grading attempts"
on public.ai_grading_attempts
to authenticated
with check ((select auth.uid()) = user_id);

alter policy "Users can read their own AI grading attempts"
on public.ai_grading_attempts
to authenticated
using ((select auth.uid()) = user_id);

alter policy "Users can update their own profile"
on public.profiles
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

alter policy "Users can view their own profile"
on public.profiles
to authenticated
using ((select auth.uid()) = id);

revoke all on table public.ai_grading_attempts
from public, anon, authenticated;

grant select, insert on table public.ai_grading_attempts
to authenticated;

revoke all on table public.profiles
from public, anon, authenticated;

grant select on table public.profiles
to authenticated;

grant update (username, target_jlpt_level) on table public.profiles
to authenticated;

revoke all on table public.sentences
from public, anon, authenticated;

grant select on table public.sentences
to authenticated;

revoke all on table public.ai_grading_attempts_summary
from public, anon, authenticated, service_role;

grant select on table public.ai_grading_attempts_summary
to authenticated, service_role;

revoke all on table public.recent_ai_grading_attempts
from public, anon, authenticated, service_role;

grant select on table public.recent_ai_grading_attempts
to authenticated, service_role;

revoke all on table public.ai_grading_sentence_progress
from public, anon, authenticated, service_role;

grant select on table public.ai_grading_sentence_progress
to authenticated, service_role;

alter default privileges for role postgres in schema public
revoke all on tables from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema public
revoke all on sequences from public, anon, authenticated, service_role;

create index ai_grading_attempts_user_created_at_idx
on public.ai_grading_attempts (user_id, created_at desc);

create index ai_grading_attempts_sentence_user_idx
on public.ai_grading_attempts (sentence_id, user_id);
