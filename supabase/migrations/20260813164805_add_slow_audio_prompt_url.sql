alter table public.sentences
add column slow_audio_prompt_url text;

comment on column public.sentences.slow_audio_prompt_url is
  'URL of the native speaker slow-speed recording.';
