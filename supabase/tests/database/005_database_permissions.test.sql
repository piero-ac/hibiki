begin;

create extension if not exists pgtap with schema extensions;

select plan(2);

-- Application policies should not apply to anonymous or public roles.
select results_eq(
  $$
    select
      tablename::text collate "C",
      policyname::text collate "C",
      roles::text collate "C"
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'ai_grading_attempts',
        'profiles',
        'sentences',
        'shadowing_attempts'
      )
    order by tablename, policyname
  $$,
  $$
    select
      tablename collate "C",
      policyname collate "C",
      roles collate "C"
    from (
      values
        (
          'ai_grading_attempts',
          'Users can create their own AI grading attempts',
          '{authenticated}'
        ),
        (
          'ai_grading_attempts',
          'Users can read their own AI grading attempts',
          '{authenticated}'
        ),
        (
          'profiles',
          'Users can update their own profile',
          '{authenticated}'
        ),
        (
          'profiles',
          'Users can view their own profile',
          '{authenticated}'
        ),
        (
          'sentences',
          'Authenticated users can read all sentences',
          '{authenticated}'
        ),
        (
          'shadowing_attempts',
          'Users can create their own shadowing attempts',
          '{authenticated}'
        ),
        (
          'shadowing_attempts',
          'Users can read their own shadowing attempts',
          '{authenticated}'
        )
    ) as expected(tablename, policyname, roles)
  $$,
  'All application policies target only authenticated users'
);

-- Authenticated users may update only user-editable profile fields.
select results_eq(
  $$
    select column_name::text collate "C"
    from information_schema.role_column_grants
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type = 'UPDATE'
    order by column_name
  $$,
  $$
    select column_name collate "C"
    from (values ('target_jlpt_level'), ('username')) as expected(column_name)
  $$,
  'Authenticated users can update only editable profile columns'
);

select * from finish();

rollback;
