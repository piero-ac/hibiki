begin;

create extension if not exists pgtap with schema extensions;

select plan(3);

-- Every Lesson needs Slow Native Audio: Steps 1–3 depend on it.
select col_not_null(
  'public',
  'sentences',
  'slow_audio_prompt_url',
  'Slow Native Audio is required on Lessons'
);

select throws_ok(
  $$
    insert into public.sentences (
      japanese_text,
      kana_text,
      english_translation,
      audio_prompt_url,
      jlpt_level
    )
    values (
      '今日は天気がいいです。',
      'きょうはてんきがいいです。',
      'The weather is nice today.',
      'sentences/test-no-slow-audio/natural.mp3',
      'N3'
    )
  $$,
  '23502',
  null,
  'A Lesson without Slow Native Audio is rejected'
);

-- Recordings are never stored (ADR 0001), so there is no Recording URL.
select hasnt_column(
  'public',
  'ai_grading_attempts',
  'audio_attempt_url',
  'AI Grading Attempts have no Recording URL column'
);

select * from finish();

rollback;
