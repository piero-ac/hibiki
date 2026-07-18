-- Local development fixture for Hibiki's three fake users.
--
-- Run this only against the local Supabase database, after creating the users
-- the script can be rerun without accumulating duplicates.
-- in local Studio. It resolves users by email and replaces their attempts so
-- the script can be rerun without accumulating duplicates.
-- the script can be rerun without accumulating duplicates.

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
      'Create these users in local Supabase Studio before loading attempts: %',
      missing_users;
  end if;
end
$$;

delete from public.attempts
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
        4,
        52
      ),
      (
        'demo@hibiki.local',
        8,
        76
      )
  ) as fixtures(email, sentence_offset, base_score)
    on fixtures.email = auth.users.email
)
insert into public.attempts (
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
 and ranked_sentences.sentence_number <= fake_users.sentence_offset + 12;

commit;

-- Expected result: 12 attempts per fake user, 36 attempts total.
select
  auth.users.email,
  count(public.attempts.id) as attempt_count,
  round(avg(public.attempts.accuracy_score)) as average_score
from auth.users
join public.attempts on public.attempts.user_id = auth.users.id
where auth.users.email in (
  'alice@hibiki.local',
  'bob@hibiki.local',
  'demo@hibiki.local'
)
group by auth.users.email
order by auth.users.email;
