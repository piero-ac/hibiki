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
      className={`w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm ${className}`}
      {...props}
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Log into your Hibiki Account
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back! Enter your credentials to access your dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:border-transparent transition-all"
          />
        </div>

        {errorCode && (
          <div className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
            {LOGIN_ERROR_MESSAGES[errorCode]}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
