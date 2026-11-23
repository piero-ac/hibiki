-- Every Lesson must have Slow Native Audio: Steps 1–3 depend on it.
alter table public.sentences
alter column slow_audio_prompt_url set not null;

comment on column public.sentences.slow_audio_prompt_url is
  'Storage path of the Slow Native Audio. Required: Steps 1–3 depend on it.';
