# Learner Recordings are never stored

A Learner's Recording lives only in the browser. It is thrown away when the Learner leaves the Lesson or records again. Submitting a Recording for an AI Grading Attempt sends it to the transcription service, then discards it: only the transcript and the Accuracy Score are kept. We chose this for privacy and to avoid storage costs, and accepted that Learners can't play back past Recordings. The unused `audio_attempt_url` column on `ai_grading_attempts` is left over from before this decision.
