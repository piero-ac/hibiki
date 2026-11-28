"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAuthError } from "@supabase/supabase-js";

type SignUpErrorCode =
  | "passwords_do_not_match"
  | "weak_password"
  | "email_already_registered"
  | "signup_disabled"
  | "rate_limited"
  | "unexpected_signup_error";

const SIGN_UP_ERROR_MESSAGES = {
  passwords_do_not_match: "Passwords do not match.",
  weak_password: "Choose a stronger password.",
  email_already_registered: "An account may already exist for this email.",
  signup_disabled: "New account registration is currently unavailable.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
  unexpected_signup_error:
    "We could not create your account. Please try again.",
} satisfies Record<SignUpErrorCode, string>;

export default function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorCode, setErrorCode] = useState<SignUpErrorCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setErrorCode(null);

    if (password !== repeatPassword) {
      setErrorCode("passwords_do_not_match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) {
        setErrorCode(getSignUpErrorCode(error));
        return;
      }
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }

      setErrorCode("unexpected_signup_error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto p-6 bg-card border border-border rounded-xl shadow-sm ${className}`}
      {...props}
    >
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Create your Hibiki Account
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your details below to get started.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-muted-foreground"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-input rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-input rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="repeatPassword"
            className="text-sm font-medium text-muted-foreground"
          >
            Confirm Password
          </label>
          <input
            id="repeatPassword"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-input rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        {errorCode && (
          <div className="text-sm font-medium text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/30">
            {SIGN_UP_ERROR_MESSAGES[errorCode]}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-primary hover:bg-accent-600 active:bg-accent-700 text-primary-foreground font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

function getSignUpErrorCode(error: unknown): SignUpErrorCode {
  if (!isAuthError(error)) {
    return "unexpected_signup_error";
  }

  if (error.status === 429) {
    return "rate_limited";
  }

  if (error.code === "weak_password") {
    return "weak_password";
  }

  if (error.code === "email_exists" || error.code === "user_already_exists") {
    return "email_already_registered";
  }

  if (error.code === "signup_disabled") {
    return "signup_disabled";
  }

  return "unexpected_signup_error";
}
