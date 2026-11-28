import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendConfirmationButton } from "@/components/auth/resend-confirmation-button";
import { Button } from "@/components/ui/button";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { email: emailParam } = await searchParams;
  const email = typeof emailParam === "string" ? emailParam.trim() : "";

  return (
    <div className="flex flex-1 flex-col gap-4.5 lg:flex-none lg:gap-5">
      <span className="grid size-22 place-items-center rounded-full bg-accent-2-500 text-background ring-10 ring-accent-2-200">
        <MailCheck className="size-9" />
      </span>

      <h1 className="mt-2 text-[34px] lg:text-display">Check your inbox.</h1>

      <p className="text-base text-pretty text-neutral-800">
        We sent a confirmation link to{" "}
        {email ? <strong>{email}</strong> : "your email"}. Open it on this
        device to finish signing up.
      </p>

      <div className="mt-auto flex flex-col gap-2.5 lg:mt-4">
        {email && <ResendConfirmationButton email={email} />}
        <Button
          asChild
          variant="ghost"
          size="lg"
          shape="pill"
          className="h-11 text-body text-accent-700"
        >
          <Link href="/auth/sign-up">Use a different email</Link>
        </Button>
      </div>
    </div>
  );
}
