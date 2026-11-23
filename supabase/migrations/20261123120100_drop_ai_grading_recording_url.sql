-- Recordings are never stored (ADR 0001), so nothing writes a Recording URL.
alter table public.ai_grading_attempts
drop column audio_attempt_url;
