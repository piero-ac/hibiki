import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AuthErrorCode =
  "invalid_or_expired_link" | "missing_auth_token" | "unexpected_auth_error";

const AUTH_ERROR_MESSAGES = {
  invalid_or_expired_link:
    "This sign-in link is invalid or has expired. Please request a new one.",
  missing_auth_token:
    "This sign-in link is missing required information. Please request a new one.",
  unexpected_auth_error: "We could not complete sign-in. Please try again.",
} satisfies Record<AuthErrorCode, string>;

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const errorCode = getAuthErrorCode(params.code);

  return (
    <p className="rounded-lg border bg-background p-3 text-sm text-neutral-800">
      {AUTH_ERROR_MESSAGES[errorCode]}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="shadow-sm">
          <CardHeader>
            <h1 className="text-2xl">Sorry, something went wrong.</h1>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Loading…</p>
              }
            >
              <ErrorContent searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getAuthErrorCode(code?: string): AuthErrorCode {
  if (
    code === "invalid_or_expired_link" ||
    code === "missing_auth_token" ||
    code === "unexpected_auth_error"
  ) {
    return code;
  }

  return "unexpected_auth_error";
}
