import { isAuthError } from "@supabase/supabase-js";

// Turns a Supabase auth error into the message a Learner sees, without
// leaking Supabase's own wording.

const RATE_LIMITED = "Too many attempts. Please wait a moment and try again.";

export function loginErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    if (error.status === 429) return RATE_LIMITED;

    if (error.code === "email_not_confirmed") {
      return "Please confirm your email before logging in.";
    }

    if (
      error.code === "invalid_credentials" ||
      error.code === "invalid_grant"
    ) {
      return "Invalid email or password.";
    }
  }

  return "We could not log you in. Please try again.";
}

export function signUpErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    if (error.status === 429) return RATE_LIMITED;

    if (error.code === "weak_password") return "Choose a stronger password.";

    if (error.code === "email_exists" || error.code === "user_already_exists") {
      return "An account may already exist for this email.";
    }

    if (error.code === "signup_disabled") {
      return "New account registration is currently unavailable.";
    }
  }

  return "We could not create your account. Please try again.";
}

export function resendErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.status === 429) return RATE_LIMITED;

  return "We could not resend the email. Please try again.";
}
