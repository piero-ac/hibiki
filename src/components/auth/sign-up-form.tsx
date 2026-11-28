"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUpErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) {
        setError(signUpErrorMessage(error));
        return;
      }
      router.push(
        `/auth/sign-up-success?${new URLSearchParams({ email }).toString()}`,
      );
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }

      setError(signUpErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignUp}
      className="flex flex-1 flex-col gap-4.5 lg:flex-none lg:gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-4xl lg:text-[40px]">Start shadowing.</h1>
        <p className="text-[15px] text-neutral-800">
          Free. Your first Lesson takes about five minutes.
        </p>
      </div>

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
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            aria-describedby="password-hint"
            className="h-12.5 px-4 text-base md:text-base"
          />
          <FieldDescription id="password-hint" className="pl-3.5 text-xs">
            Use at least {MIN_PASSWORD_LENGTH} characters.
          </FieldDescription>
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
        {isLoading ? "Creating account…" : "Create account"}
      </Button>

      <p className="mt-auto text-center text-[15px] text-neutral-800 lg:mt-0 lg:text-left">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-bold text-accent-700 hover:text-accent-800"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
