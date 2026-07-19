begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

insert into auth.users (id, email)
values (
  '40000000-0000-0000-0000-000000000001'::uuid,
  'trigger-alice@hibiki.test'
);

select results_eq(
  $$
    select count(*)
    from public.profiles
    where id = '40000000-0000-0000-0000-000000000001'::uuid
  $$,
  array[1::bigint],
  'Creating an Auth user creates exactly one profile'
);

select results_eq(
  $$
    select username
    from public.profiles
    where id = '40000000-0000-0000-0000-000000000001'::uuid
  $$,
  array['trigger-alice'::text],
  'The profile username defaults to the email local part'
);

select results_eq(
  $$
    select target_jlpt_level
    from public.profiles
    where id = '40000000-0000-0000-0000-000000000001'::uuid
  $$,
  array['N5'::text],
  'A new profile defaults to JLPT N5'
);

select lives_ok(
  $$
    delete from auth.users
    where id = '40000000-0000-0000-0000-000000000001'::uuid
  $$,
  'Deleting the Auth user succeeds'
);

select results_eq(
  $$
    select count(*)
    from public.profiles
    where id = '40000000-0000-0000-0000-000000000001'::uuid
  $$,
  array[0::bigint],
  'Deleting an Auth user cascades to its profile'
);

select * from finish();

rollback;
