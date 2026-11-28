"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isAuthError } from "@supabase/supabase-js";

type LoginErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "rate_limited"
  | "unexpected_login_error";

const LOGIN_ERROR_MESSAGES = {
  invalid_credentials: "Invalid email or password.",
  email_not_confirmed: "Please confirm your email before logging in.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
  unexpected_login_error: "We could not log you in. Please try again.",
} satisfies Record<LoginErrorCode, string>;

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState<LoginErrorCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();

    setIsLoading(true);
    setErrorCode(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorCode(getLoginErrorCode(error));
        return;
      }

      router.push("/protected");
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }

      setErrorCode("unexpected_login_error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto p-6 bg-card border border-border rounded-xl shadow-sm ${className}`}
      {...props}
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Log into your Hibiki Account
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Enter your credentials to access your dashboard.
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

        {errorCode && (
          <div className="text-sm font-medium text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/30">
            {LOGIN_ERROR_MESSAGES[errorCode]}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-primary hover:bg-accent-600 active:bg-accent-700 text-primary-foreground font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

function getLoginErrorCode(error: unknown): LoginErrorCode {
  if (!isAuthError(error)) {
    return "unexpected_login_error";
  }

  if (error.status === 429) {
    return "rate_limited";
  }

  if (error.code === "email_not_confirmed") {
    return "email_not_confirmed";
  }

  if (error.code === "invalid_credentials" || error.code === "invalid_grant") {
    return "invalid_credentials";
  }

  return "unexpected_login_error";
}
