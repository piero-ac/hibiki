-- A blank Native Audio path points at no audio, so treat it like a missing one.
alter table public.sentences
add constraint sentences_audio_prompt_url_not_blank
check (btrim(audio_prompt_url) <> '');

alter table public.sentences
add constraint sentences_slow_audio_prompt_url_not_blank
check (btrim(slow_audio_prompt_url) <> '');
