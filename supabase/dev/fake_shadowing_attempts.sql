-- Local Shadowing Attempt fixture for the demo Learner.
--
-- Demo Mode is read-only and can't Mark Done, so this is the only source of
-- its Activity. Run this only against the local Supabase database. It replaces
-- the demo Learner's Shadowing Attempts, so it can be rerun without duplicates.

begin;

do $$
begin
  if not exists (
    select 1 from auth.users where email = 'demo@hibiki.local'
  ) then
    raise exception
      'Create demo@hibiki.local in local Supabase before loading Shadowing Attempts.';
  end if;
end
$$;

delete from public.shadowing_attempts
where user_id = (
  select id from auth.users where email = 'demo@hibiki.local'
);

-- Each seeded Lesson is marked done on a different day, and the first Lesson
-- is repeated, so Lessons Completed, Lessons Practiced and Days Practiced all
-- differ.
with ranked_sentences as (
  select id, row_number() over (order by created_at, id) as sentence_number
  from public.sentences
),
fixtures(sentence_number, days_ago, hour) as (
  values
    (1, 6, 9),
    (2, 4, 20),
    (1, 2, 8),
    (3, 1, 19),
    (3, 1, 21)
)
insert into public.shadowing_attempts (user_id, sentence_id, completed_at)
select
  demo.id,
  ranked_sentences.id,
  date_trunc('day', now())
    - fixtures.days_ago * interval '1 day'
    + fixtures.hour * interval '1 hour'
from fixtures
join ranked_sentences using (sentence_number)
cross join (
  select id from auth.users where email = 'demo@hibiki.local'
) as demo;

commit;

-- Expected result: 5 Shadowing Attempts over 3 Lessons and 4 days.
select
  count(*) as lessons_completed,
  count(distinct sentence_id) as lessons_practiced,
  count(distinct completed_at::date) as days_practiced
from public.shadowing_attempts
where user_id = (select id from auth.users where email = 'demo@hibiki.local');
