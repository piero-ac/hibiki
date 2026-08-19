alter table public.attempts
rename to ai_grading_attempts;

alter table public.ai_grading_attempts
rename constraint attempts_pkey to ai_grading_attempts_pkey;

alter table public.ai_grading_attempts
rename constraint attempts_accuracy_score_check
to ai_grading_attempts_accuracy_score_check;

alter table public.ai_grading_attempts
rename constraint attempts_sentence_id_fkey
to ai_grading_attempts_sentence_id_fkey;

alter table public.ai_grading_attempts
rename constraint attempts_user_id_fkey
to ai_grading_attempts_user_id_fkey;

alter policy "Users can insert their own practice attempts"
on public.ai_grading_attempts
rename to "Users can create their own AI grading attempts";

alter policy "Users can view their own practice attempts"
on public.ai_grading_attempts
rename to "Users can read their own AI grading attempts";

alter view public.attempts_summary
rename to ai_grading_attempts_summary;

alter view public.recent_attempts
rename to recent_ai_grading_attempts;

alter view public.sentence_progress
rename to ai_grading_sentence_progress;

comment on table public.ai_grading_attempts is
  'Stores optional AI pronunciation grading submissions and their results.';
