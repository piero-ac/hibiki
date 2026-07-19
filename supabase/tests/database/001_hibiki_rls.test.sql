begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

-- Test setup
-- Set up auth.users entries
insert into auth.users (id, email) values
	('10000000-0000-0000-0000-000000000001'::uuid, 'rls-alice@hibiki.test'),
	('10000000-0000-0000-0000-000000000002'::uuid, 'rls-bob@hibiki.test');

-- create test sentences
INSERT INTO public.sentences (
    id,
    created_at,
    japanese_text,
    kana_text,
    english_translation,
    audio_prompt_url,
    jlpt_level,
    category
)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    '2026-06-29 00:15:54.244294+00',
    '問題の原因を特定するまでに予想以上の時間がかかりました。',
    'もんだいのげんいんをとくていするまでによそういじょうのじかんがかかりました。',
    'It took longer than expected to identify the cause of the problem.',
    'https://example.com/audio/test-sentence-001.mp3',
    'N2',
    'Workplace'
);

-- create test attempts
INSERT INTO public.attempts (
    id,
    created_at,
    user_id,
    sentence_id,
    audio_attempt_url,
    accuracy_score,
    user_audio_transcript
)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '2026-06-28 00:01:23.828714+00',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NULL,
    88.00,
    'この機能を実装することで、業務効率の向上が期待できます。'
),
(
    '30000000-0000-0000-0000-000000000002',
    '2026-07-14 02:01:23.828714+00',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NULL,
    74.00,
    '何か困ったことがあったら遠慮せずに相談してください。'
),
(
    '30000000-0000-0000-0000-000000000003',
    '2026-07-11 02:01:23.828714+00',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    NULL,
    95.00,
    '昨日は夜遅くまで起きていたせいで、朝なかなか起きられなかった。'
);

-- as Alice
set local role authenticated;
set local "request.jwt.claims" = '{
  "sub": "10000000-0000-0000-0000-000000000001",
  "role": "authenticated"
}';

-- Test cases
-- RLS Tests
-- 1: Confirm the identity simulation works
select ok(
  auth.uid() = '10000000-0000-0000-0000-000000000001'::uuid,
  'Alice JWT resolves to Alice'
);


-- 2: Authenticated users can read sentences
select results_eq(
  $$
    select count(*)
    from public.sentences
    where id = '20000000-0000-0000-0000-000000000001'::uuid
  $$,
  array[1::bigint],
  'Alice can read the test sentence'
);

-- 3: Alice sees her attempts
select results_eq(
  $$ select count(*) from public.attempts $$,
  array[2::bigint],
  'Alice sees only her two attempts'
);

-- 4: Bob's rows are invisible to Alice
select results_eq(
  $$
    select count(*)
    from public.attempts
    where user_id = '10000000-0000-0000-0000-000000000002'::uuid
  $$,
  array[0::bigint],
  'Alice cannot see Bob attempts'
);

-- 5: Alice sees only her profile
select results_eq(
  $$ select count(*) from public.profiles $$,
  array[1::bigint],
  'Alice sees only her profile'
);

-- Authorization tests
-- 6: Alice can insert an attempt for herself
select lives_ok(
  $$
    insert into public.attempts (
      id,
      user_id,
      sentence_id,
      accuracy_score,
      user_audio_transcript
    )
    values (
      '30000000-0000-0000-0000-000000000004'::uuid,
      '10000000-0000-0000-0000-000000000001'::uuid,
      '20000000-0000-0000-0000-000000000001'::uuid,
      82,
      'Alice authorized insert'
    )
  $$,
  'Alice can insert her own attempt'
);

-- 7: Alice cannot insert an attempt owned by Bob
select throws_ok(
  $$
    insert into public.attempts (
      id,
      user_id,
      sentence_id,
      accuracy_score,
      user_audio_transcript
    )
    values (
      '30000000-0000-0000-0000-000000000005'::uuid,
      '10000000-0000-0000-0000-000000000002'::uuid,
      '20000000-0000-0000-0000-000000000001'::uuid,
      100,
      'Malicious cross-user insert'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "attempts"',
  'Alice cannot insert an attempt for Bob'
);

-- 8: Alice can update her own profile
select results_eq(
  $$
    update public.profiles
    set target_jlpt_level = 'N1'
    where id = '10000000-0000-0000-0000-000000000001'::uuid
    returning id
  $$,
  $$
    values ('10000000-0000-0000-0000-000000000001'::uuid)
  $$,
  'Alice can update her own profile'
);

-- 9: Alice cannot update Bob's profile
select results_eq(
  $$
    update public.profiles
    set target_jlpt_level = 'N1'
    where id = '10000000-0000-0000-0000-000000000002'::uuid
    returning id
  $$,
  $$
    select id
    from public.profiles
    where false
  $$,
  'Alice cannot update Bob profile'
);

-- 10: Alice cannot update an existing attempt
select results_eq(
  $$
    update public.attempts
    set accuracy_score = 100
    where id = '30000000-0000-0000-0000-000000000001'::uuid
    returning id
  $$,
  $$
    select id
    from public.attempts
    where false
  $$,
  'Alice cannot update an existing attempt'
);

-- 11: Alice cannot delete an existing attempt
select results_eq(
  $$
    delete from public.attempts
    where id = '30000000-0000-0000-0000-000000000001'::uuid
    returning id
  $$,
  $$
    select id
    from public.attempts
    where false
  $$,
  'Alice cannot delete an existing attempt'
);

-- Switch from Alice to Bob
set local "request.jwt.claims" = '{
  "sub": "10000000-0000-0000-0000-000000000002",
  "role": "authenticated"
}';

-- 12: Bob's JWT resolves to Bob
select ok(
  auth.uid() = '10000000-0000-0000-0000-000000000002'::uuid,
  'Bob JWT resolves to Bob'
);

-- 13: Bob sees only his attempt
select results_eq(
  $$ select count(*) from public.attempts $$,
  array[1::bigint],
  'Bob sees only his attempt'
);

-- 14: Bob cannot see Alice's attempts
select results_eq(
  $$
    select count(*)
    from public.attempts
    where user_id = '10000000-0000-0000-0000-000000000001'::uuid
  $$,
  array[0::bigint],
  'Bob cannot see Alice attempts'
);

-- 15: Bob sees only his profile
select results_eq(
  $$ select count(*) from public.profiles $$,
  array[1::bigint],
  'Bob sees only his profile'
);

-- 16: Bob's summary includes only his attempt
select results_eq(
  $$ select total_attempts from public.attempts_summary $$,
  array[1::bigint],
  'Bob summary includes only his attempt'
);

-- 17: Bob's recent-attempt view contains only his attempt
select results_eq(
  $$ select count(*) from public.recent_attempts $$,
  array[1::bigint],
  'Bob recent attempts include only his attempt'
);

-- 18: Bob's sentence progress includes only his attempt
select results_eq(
  $$ select attempt_count from public.sentence_progress $$,
  array[1::bigint],
  'Bob sentence progress includes only his attempt'
);

select * from finish();

rollback;