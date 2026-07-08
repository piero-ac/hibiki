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
    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 overflow-x-auto">
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
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Sorry, something went wrong.
              </h2>
            </div>
            <div className="p-6 pt-0">
              <Suspense
                fallback={<p className="text-sm text-zinc-400">Loading...</p>}
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
