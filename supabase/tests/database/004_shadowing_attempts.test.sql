begin;

create extension if not exists pgtap with schema extensions;

select plan(11);

-- Arrange: create a user and sentence for these tests.
insert into auth.users (id, email)
values
  (
    '70000000-0000-0000-0000-000000000001'::uuid,
    'shadowing-alice@hibiki.test'
  ),
  (
    '70000000-0000-0000-0000-000000000002'::uuid,
    'shadowing-bob@hibiki.test'
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
values (
  '71000000-0000-0000-0000-000000000001'::uuid,
  '今日は天気がいいです。',
  'きょうはてんきがいいです。',
  'The weather is nice today.',
  'sentences/test-shadowing/natural.mp3',
  'sentences/test-shadowing/slow.mp3',
  'N3',
  'Everyday Life'
);

-- Seed Bob's attempt as the privileged test role so Alice's read policy can
-- be tested against a row owned by another user.
insert into public.shadowing_attempts (
  id,
  user_id,
  sentence_id
)
values (
  '72000000-0000-0000-0000-000000000002'::uuid,
  '70000000-0000-0000-0000-000000000002'::uuid,
  '71000000-0000-0000-0000-000000000001'::uuid
);

-- Test 1: confirm that the migration created the table.
select has_table(
  'public',
  'shadowing_attempts',
  'The shadowing_attempts table exists'
);

-- Act as Alice for the RLS tests.
set local role authenticated;

set local "request.jwt.claims" = '{
  "sub": "70000000-0000-0000-0000-000000000001",
  "role": "authenticated"
}';

-- Test 2: Alice can insert an attempt owned by Alice.
select lives_ok(
  $$
    insert into public.shadowing_attempts (
      id,
      user_id,
      sentence_id
    )
    values (
      '72000000-0000-0000-0000-000000000001'::uuid,
      '70000000-0000-0000-0000-000000000001'::uuid,
      '71000000-0000-0000-0000-000000000001'::uuid
    )
  $$,
  'Alice can create her own shadowing attempt'
);

-- Test 3: Alice can read the attempt she created.
select results_eq(
  $$
    select count(*)
    from public.shadowing_attempts
    where id = '72000000-0000-0000-0000-000000000001'::uuid
  $$,
  array[1::bigint],
  'Alice can read her own shadowing attempt'
);

-- Test 4: Alice cannot create an attempt owned by Bob.
select throws_ok(
  $$
    insert into public.shadowing_attempts (
      id,
      user_id,
      sentence_id
    )
    values (
      '72000000-0000-0000-0000-000000000004'::uuid,
      '70000000-0000-0000-0000-000000000002'::uuid,
      '71000000-0000-0000-0000-000000000001'::uuid
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "shadowing_attempts"',
  'Alice cannot create a shadowing attempt for Bob'
);

-- Test 5: Bob's attempt is hidden from Alice.
select results_eq(
  $$
    select count(*)
    from public.shadowing_attempts
    where user_id = '70000000-0000-0000-0000-000000000002'::uuid
  $$,
  array[0::bigint],
  'Alice cannot read Bob shadowing attempts'
);

-- Test 6: attempts are immutable, even when Alice owns the row.
select throws_ok(
  $$
    update public.shadowing_attempts
    set completed_at = now()
    where id = '72000000-0000-0000-0000-000000000001'::uuid
  $$,
  '42501',
  'permission denied for table shadowing_attempts',
  'Alice cannot update a shadowing attempt'
);

-- Test 7: users cannot delete completed attempts.
select throws_ok(
  $$
    delete from public.shadowing_attempts
    where id = '72000000-0000-0000-0000-000000000001'::uuid
  $$,
  '42501',
  'permission denied for table shadowing_attempts',
  'Alice cannot delete a shadowing attempt'
);

-- Act as an unauthenticated request.
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';

-- Test 8: anonymous users have no read permission.
select throws_ok(
  $$ select count(*) from public.shadowing_attempts $$,
  '42501',
  'permission denied for table shadowing_attempts',
  'Anonymous users cannot read shadowing attempts'
);

-- Test 9: anonymous users have no insert permission.
select throws_ok(
  $$
    insert into public.shadowing_attempts (
      id,
      user_id,
      sentence_id
    )
    values (
      '72000000-0000-0000-0000-000000000005'::uuid,
      '70000000-0000-0000-0000-000000000001'::uuid,
      '71000000-0000-0000-0000-000000000001'::uuid
    )
  $$,
  '42501',
  'permission denied for table shadowing_attempts',
  'Anonymous users cannot create shadowing attempts'
);

reset role;

-- Test 10: deleting a sentence removes all attempts for that sentence.
delete from public.sentences
where id = '71000000-0000-0000-0000-000000000001'::uuid;

select results_eq(
  $$
    select count(*)
    from public.shadowing_attempts
    where sentence_id = '71000000-0000-0000-0000-000000000001'::uuid
  $$,
  array[0::bigint],
  'Deleting a sentence cascades to its shadowing attempts'
);

-- Test 11 setup: create a separate user, sentence, and attempt so the profile
-- foreign key can be tested independently from the sentence cascade above.
insert into auth.users (id, email)
values (
  '70000000-0000-0000-0000-000000000003'::uuid,
  'shadowing-charlie@hibiki.test'
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
values (
  '71000000-0000-0000-0000-000000000002'::uuid,
  '電車で学校に行きます。',
  'でんしゃでがっこうにいきます。',
  'I go to school by train.',
  'sentences/test-profile-cascade/natural.mp3',
  'sentences/test-profile-cascade/slow.mp3',
  'N3',
  'Everyday Life'
);

insert into public.shadowing_attempts (
  id,
  user_id,
  sentence_id
)
values (
  '72000000-0000-0000-0000-000000000003'::uuid,
  '70000000-0000-0000-0000-000000000003'::uuid,
  '71000000-0000-0000-0000-000000000002'::uuid
);

delete from public.profiles
where id = '70000000-0000-0000-0000-000000000003'::uuid;

select results_eq(
  $$
    select count(*)
    from public.shadowing_attempts
    where id = '72000000-0000-0000-0000-000000000003'::uuid
  $$,
  array[0::bigint],
  'Deleting a profile cascades to its shadowing attempts'
);

select * from finish();

rollback;
