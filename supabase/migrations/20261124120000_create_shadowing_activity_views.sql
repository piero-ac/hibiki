-- Activity views over Shadowing Attempts, following the AI grading views:
-- invoker security, filtered to the current Learner, readable only by
-- authenticated users.

create view public.shadowing_activity_summary
with (security_invoker = true) as
select
  count(*) as lessons_completed,
  count(distinct sentence_id) as lessons_practiced,
  count(distinct completed_at::date) as days_practiced
from public.shadowing_attempts
where user_id = (select auth.uid());

comment on view public.shadowing_activity_summary is
  'Activity totals from the current Learner''s Shadowing Attempts.';

create view public.recent_shadowing_attempts
with (security_invoker = true) as
select
  a.id,
  a.completed_at,
  s.id as sentence_id,
  s.japanese_text,
  s.jlpt_level,
  s.category
from public.shadowing_attempts a
join public.sentences s on s.id = a.sentence_id
where a.user_id = (select auth.uid())
order by a.completed_at desc, a.id desc;

comment on view public.recent_shadowing_attempts is
  'The current Learner''s Shadowing Attempts with their Lesson, newest first.';

revoke all on table public.shadowing_activity_summary
from public, anon, authenticated, service_role;

grant select on table public.shadowing_activity_summary
to authenticated;

revoke all on table public.recent_shadowing_attempts
from public, anon, authenticated, service_role;

grant select on table public.recent_shadowing_attempts
to authenticated;
