"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginErrorMessage } from "@/lib/auth/errors";
import { PUBLIC_SIGN_UP_ENABLED } from "@/lib/auth/sign-up";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(loginErrorMessage(error));
        return;
      }

      router.push("/protected");
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }

      setError(loginErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-1 flex-col gap-4.5 lg:flex-none lg:gap-5"
    >
      <h1 className="text-4xl lg:text-[40px]">
        <span lang="ja" className="lg:hidden">
          おかえり.
          <br />
        </span>
        Welcome back.
      </h1>

      <FieldGroup className="gap-3.5">
        <Field>
          <FieldLabel htmlFor="email" className="text-neutral-800">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            aria-invalid={error ? true : undefined}
            className="h-12.5 px-4 text-base md:text-base"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="text-neutral-800">
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            aria-invalid={error ? true : undefined}
            className="h-12.5 px-4 text-base md:text-base"
          />
        </Field>
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        shape="pill"
        disabled={isLoading}
        className="h-13.5 text-[17px] lg:h-13"
      >
        {isLoading ? "Logging in…" : "Log in"}
      </Button>

      {PUBLIC_SIGN_UP_ENABLED && (
        <p className="mt-auto text-center text-[15px] text-neutral-800 lg:mt-0 lg:text-left">
          New to Hibiki?{" "}
          <Link
            href="/auth/sign-up"
            className="font-bold text-accent-700 hover:text-accent-800"
          >
            Sign up
          </Link>
        </p>
      )}
    </form>
  );
}
