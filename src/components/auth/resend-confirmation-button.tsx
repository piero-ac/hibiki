"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resendErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

type ResendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "failed"; message: string };

export function ResendConfirmationButton({ email }: { email: string }) {
  const [state, setState] = useState<ResendState>({ kind: "idle" });

  const resend = async () => {
    setState({ kind: "sending" });

    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });

      setState(
        error
          ? { kind: "failed", message: resendErrorMessage(error) }
          : { kind: "sent" },
      );
    } catch (error: unknown) {
      setState({ kind: "failed", message: resendErrorMessage(error) });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        shape="pill"
        disabled={state.kind === "sending"}
        onClick={resend}
        className="h-12.5 text-base"
      >
        {state.kind === "sending" ? "Sending…" : "Resend email"}
      </Button>
      <p role="status" className="text-center text-sm text-neutral-800">
        {state.kind === "sent" && "Sent. Check your inbox again."}
        {state.kind === "failed" && (
          <span className="text-destructive">{state.message}</span>
        )}
      </p>
    </div>
  );
}
