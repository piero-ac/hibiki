begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

insert into auth.users (id, email)
values (
  '50000000-0000-0000-0000-000000000001'::uuid,
  'storage-alice@hibiki.test'
);

insert into storage.buckets (id, name, public)
values ('private-test', 'private-test', false)
on conflict (id) do nothing;

insert into storage.objects (id, bucket_id, name, owner_id)
values
  (
    '60000000-0000-0000-0000-000000000002'::uuid,
    'private-test',
    'private/test-file.txt',
    '50000000-0000-0000-0000-000000000001'
  ),
  (
    '60000000-0000-0000-0000-000000000007'::uuid,
    'lesson-audio',
    'sentences/test-lesson/natural.mp3',
    '50000000-0000-0000-0000-000000000001'
  );

select results_eq(
  $$
    select public
    from storage.buckets
    where id = 'lesson-audio'
  $$,
  array[false],
  'The lesson-audio bucket is private'
);

set local role authenticated;
set local "request.jwt.claims" = '{
  "sub": "50000000-0000-0000-0000-000000000001",
  "role": "authenticated"
}';

select ok(
  auth.uid() = '50000000-0000-0000-0000-000000000001'::uuid,
  'Authenticated Storage JWT resolves to Alice'
);

select results_eq(
  $$
    select count(*)
    from storage.objects
    where id = '60000000-0000-0000-0000-000000000007'::uuid
  $$,
  array[1::bigint],
  'Authenticated users can read objects in the lesson-audio bucket'
);

select results_eq(
  $$
    select count(*)
    from storage.objects
    where id = '60000000-0000-0000-0000-000000000002'::uuid
  $$,
  array[0::bigint],
  'Authenticated users cannot read objects outside the lesson-audio bucket'
);

select throws_ok(
  $$
    insert into storage.objects (id, bucket_id, name, owner_id)
    values (
      '60000000-0000-0000-0000-000000000003'::uuid,
      'lesson-audio',
      'sentences/test-lesson/unauthorized.mp3',
      '50000000-0000-0000-0000-000000000001'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'Authenticated users cannot upload to the lesson-audio bucket'
);

set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';

select ok(
  auth.uid() is null,
  'Anonymous Storage requests have no authenticated user ID'
);

select results_eq(
  $$
    select count(*)
    from storage.objects
    where id = '60000000-0000-0000-0000-000000000007'::uuid
  $$,
  array[0::bigint],
  'Anonymous users cannot read objects in the lesson-audio bucket'
);

select throws_ok(
  $$
    insert into storage.objects (id, bucket_id, name, owner_id)
    values (
      '60000000-0000-0000-0000-000000000006'::uuid,
      'lesson-audio',
      'sentences/test-lesson/anonymous.mp3',
      null
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'Anonymous users cannot upload to the lesson-audio bucket'
);

reset role;

select * from finish();

rollback;
