import { AuthApiError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  loginErrorMessage,
  resendErrorMessage,
  signUpErrorMessage,
} from "@/lib/auth/errors";

describe("loginErrorMessage", () => {
  it("says the email or password is wrong for invalid credentials", () => {
    const error = new AuthApiError("bad", 400, "invalid_credentials");

    expect(loginErrorMessage(error)).toBe("Invalid email or password.");
  });

  it("asks the Learner to confirm their email first", () => {
    const error = new AuthApiError("no", 400, "email_not_confirmed");

    expect(loginErrorMessage(error)).toBe(
      "Please confirm your email before logging in.",
    );
  });

  it("asks the Learner to wait when rate limited", () => {
    const error = new AuthApiError("slow down", 429, "over_request_rate_limit");

    expect(loginErrorMessage(error)).toBe(
      "Too many attempts. Please wait a moment and try again.",
    );
  });

  it("falls back to a generic message for anything else", () => {
    expect(loginErrorMessage(new Error("network"))).toBe(
      "We could not log you in. Please try again.",
    );
  });
});

describe("signUpErrorMessage", () => {
  it("hints that an account may exist without confirming it", () => {
    const error = new AuthApiError("taken", 422, "user_already_exists");

    expect(signUpErrorMessage(error)).toBe(
      "An account may already exist for this email.",
    );
  });

  it("asks for a stronger password when Supabase rejects it", () => {
    const error = new AuthApiError("weak", 422, "weak_password");

    expect(signUpErrorMessage(error)).toBe("Choose a stronger password.");
  });

  it("says registration is unavailable when sign up is disabled", () => {
    const error = new AuthApiError("off", 422, "signup_disabled");

    expect(signUpErrorMessage(error)).toBe(
      "New account registration is currently unavailable.",
    );
  });

  it("falls back to a generic message for anything else", () => {
    expect(signUpErrorMessage(new Error("network"))).toBe(
      "We could not create your account. Please try again.",
    );
  });
});

describe("resendErrorMessage", () => {
  it("asks the Learner to wait when emails are rate limited", () => {
    const error = new AuthApiError("slow", 429, "over_email_send_rate_limit");

    expect(resendErrorMessage(error)).toBe(
      "Too many attempts. Please wait a moment and try again.",
    );
  });

  it("falls back to a generic message for anything else", () => {
    expect(resendErrorMessage(new Error("network"))).toBe(
      "We could not resend the email. Please try again.",
    );
  });
});
