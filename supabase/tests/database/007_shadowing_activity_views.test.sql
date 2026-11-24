begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

-- Arrange: two Learners, two Lessons, and Shadowing Attempts for both.
insert into auth.users (id, email)
values
  (
    '80000000-0000-0000-0000-000000000001'::uuid,
    'activity-alice@hibiki.test'
  ),
  (
    '80000000-0000-0000-0000-000000000002'::uuid,
    'activity-bob@hibiki.test'
  );

insert into public.sentences (
  id,
  japanese_text,
  kana_text,
  english_translation,
  audio_prompt_url,
  slow_audio_prompt_url,
  jlpt_level,
  category
)
values
  (
    '81000000-0000-0000-0000-000000000001'::uuid,
    '今日は天気がいいです。',
    'きょうはてんきがいいです。',
    'The weather is nice today.',
    'sentences/test-activity-a/natural.mp3',
    'sentences/test-activity-a/slow.mp3',
    'N3',
    'Everyday Life'
  ),
  (
    '81000000-0000-0000-0000-000000000002'::uuid,
    '電車で学校に行きます。',
    'でんしゃでがっこうにいきます。',
    'I go to school by train.',
    'sentences/test-activity-b/natural.mp3',
    'sentences/test-activity-b/slow.mp3',
    'N2',
    null
  );

-- Alice: Lesson A twice on one day, Lesson B on another day.
-- Bob: Lesson A once.
insert into public.shadowing_attempts (id, user_id, sentence_id, completed_at)
values
  (
    '82000000-0000-0000-0000-000000000001'::uuid,
    '80000000-0000-0000-0000-000000000001'::uuid,
    '81000000-0000-0000-0000-000000000001'::uuid,
    '2026-03-01 09:00:00+00'
  ),
  (
    '82000000-0000-0000-0000-000000000002'::uuid,
    '80000000-0000-0000-0000-000000000001'::uuid,
    '81000000-0000-0000-0000-000000000001'::uuid,
    '2026-03-01 18:00:00+00'
  ),
  (
    '82000000-0000-0000-0000-000000000003'::uuid,
    '80000000-0000-0000-0000-000000000001'::uuid,
    '81000000-0000-0000-0000-000000000002'::uuid,
    '2026-03-02 09:00:00+00'
  ),
  (
    '82000000-0000-0000-0000-000000000004'::uuid,
    '80000000-0000-0000-0000-000000000002'::uuid,
    '81000000-0000-0000-0000-000000000001'::uuid,
    '2026-03-05 09:00:00+00'
  );

-- Test 1
select has_view(
  'public',
  'shadowing_activity_summary',
  'The shadowing_activity_summary view exists'
);

-- Test 2
select has_view(
  'public',
  'recent_shadowing_attempts',
  'The recent_shadowing_attempts view exists'
);

-- Act as Alice.
set local role authenticated;

set local "request.jwt.claims" = '{
  "sub": "80000000-0000-0000-0000-000000000001",
  "role": "authenticated"
}';

-- Test 3: Alice's summary counts only her Shadowing Attempts.
select results_eq(
  $$
    select lessons_completed, lessons_practiced, days_practiced
    from public.shadowing_activity_summary
  $$,
  $$ values (3::bigint, 2::bigint, 2::bigint) $$,
  'Alice summary counts only her Shadowing Attempts'
);

-- Test 4: Alice's recent activity lists only her attempts, newest first.
select results_eq(
  $$ select id from public.recent_shadowing_attempts $$,
  $$
    values
      ('82000000-0000-0000-0000-000000000003'::uuid),
      ('82000000-0000-0000-0000-000000000002'::uuid),
      ('82000000-0000-0000-0000-000000000001'::uuid)
  $$,
  'Alice recent activity lists only her attempts, newest first'
);

-- Act as Bob.
set local "request.jwt.claims" = '{
  "sub": "80000000-0000-0000-0000-000000000002",
  "role": "authenticated"
}';

-- Test 5: Bob's summary counts only his Shadowing Attempt.
select results_eq(
  $$
    select lessons_completed, lessons_practiced, days_practiced
    from public.shadowing_activity_summary
  $$,
  $$ values (1::bigint, 1::bigint, 1::bigint) $$,
  'Bob summary counts only his Shadowing Attempt'
);

-- Test 6: Bob's recent activity lists only his attempt.
select results_eq(
  $$ select id from public.recent_shadowing_attempts $$,
  $$ values ('82000000-0000-0000-0000-000000000004'::uuid) $$,
  'Bob recent activity lists only his attempt'
);

-- Act as an unauthenticated request.
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';

-- Test 7
select throws_ok(
  $$ select * from public.shadowing_activity_summary $$,
  '42501',
  'permission denied for view shadowing_activity_summary',
  'Anonymous users cannot read the shadowing activity summary'
);

-- Test 8
select throws_ok(
  $$ select * from public.recent_shadowing_attempts $$,
  '42501',
  'permission denied for view recent_shadowing_attempts',
  'Anonymous users cannot read recent shadowing attempts'
);

select * from finish();

rollback;
