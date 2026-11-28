import { Suspense } from "react";

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
    <p className="text-sm text-muted-foreground font-mono bg-background p-3 rounded-lg border border-border overflow-x-auto">
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
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Sorry, something went wrong.
              </h2>
            </div>
            <div className="p-6 pt-0">
              <Suspense
                fallback={
                  <p className="text-sm text-muted-foreground">Loading...</p>
                }
              >
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
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
