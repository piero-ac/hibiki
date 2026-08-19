-- Local AI grading fixture for Hibiki's three fake users.
--
-- Run this only against the local Supabase database. It resolves users by
-- email and replaces their AI grading attempts, so it can be rerun without
-- duplicates.

begin;

do $$
declare
  missing_users text;
begin
  select string_agg(expected.email, ', ' order by expected.email)
  into missing_users
  from (
    values
      ('alice@hibiki.local'),
      ('bob@hibiki.local'),
      ('demo@hibiki.local')
  ) as expected(email)
  where not exists (
    select 1
    from auth.users
    where auth.users.email = expected.email
  );

  if missing_users is not null then
    raise exception
      'Create these users in local Supabase Studio before loading AI grading attempts: %',
      missing_users;
  end if;
end
$$;

delete from public.ai_grading_attempts
where user_id in (
  select id
  from auth.users
  where email in (
    'alice@hibiki.local',
    'bob@hibiki.local',
    'demo@hibiki.local'
  )
);

with ranked_sentences as (
  select
    id,
    japanese_text,
    row_number() over (order by created_at, id) as sentence_number
  from public.sentences
),
fake_users as (
  select auth.users.id as user_id, fixtures.sentence_offset, fixtures.base_score
  from auth.users
  join (
    values
      (
        'alice@hibiki.local',
        0,
        68
      ),
      (
        'bob@hibiki.local',
        0,
        52
      ),
      (
        'demo@hibiki.local',
        0,
        76
      )
  ) as fixtures(email, sentence_offset, base_score)
    on fixtures.email = auth.users.email
)
insert into public.ai_grading_attempts (
  user_id,
  sentence_id,
  accuracy_score,
  user_audio_transcript,
  created_at
)
select
  fake_users.user_id,
  ranked_sentences.id,
  least(
    100,
    fake_users.base_score
      + ((ranked_sentences.sentence_number * 7 + fake_users.sentence_offset) % 29)
  ),
  ranked_sentences.japanese_text,
  now()
    - ((ranked_sentences.sentence_number + fake_users.sentence_offset) * interval '1 day')
    + ((ranked_sentences.sentence_number % 3) * interval '2 hours')
from fake_users
join ranked_sentences
  on ranked_sentences.sentence_number > fake_users.sentence_offset
 and ranked_sentences.sentence_number <= fake_users.sentence_offset + 3;

commit;

-- Expected result: 3 AI grading attempts per fake user, 9 attempts total.
select
  auth.users.email,
  count(public.ai_grading_attempts.id) as attempt_count,
  round(avg(public.ai_grading_attempts.accuracy_score)) as average_score
from auth.users
join public.ai_grading_attempts
  on public.ai_grading_attempts.user_id = auth.users.id
where auth.users.email in (
  'alice@hibiki.local',
  'bob@hibiki.local',
  'demo@hibiki.local'
)
group by auth.users.email
order by auth.users.email;
