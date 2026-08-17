-- The legacy public audio bucket is being retired. Its authenticated upload
-- and read policies are no longer part of the supported application flow.
drop policy if exists "admin_upload 1jgvrq_0" on storage.objects;
drop policy if exists "authenticated_users_read 1jgvrq_0" on storage.objects;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'lesson-audio',
  'lesson-audio',
  false,
  10485760,
  array['audio/mpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can read lesson audio"
on storage.objects
for select
to authenticated
using (bucket_id = 'lesson-audio');
