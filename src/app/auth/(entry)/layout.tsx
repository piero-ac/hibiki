import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shared frame for log in, sign up and "check your inbox" (mockups 5c–5f).
// Phone: back button and brand on top, form below. Desktop: a sand panel
// with a sample Sentence on the left, the form on the right.
export default function AuthEntryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_520px]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-card px-12 py-10 lg:flex">
        <span
          aria-hidden
          className="absolute -right-30 -bottom-35 size-115 rounded-full bg-accent-2-200 opacity-65"
        />
        <span
          aria-hidden
          className="absolute right-60 bottom-55 size-27.5 rounded-full bg-accent-200 opacity-70"
        />
        <Link href="/" className="relative self-start font-heading text-[26px]">
          Hibiki
          <span className="ml-1.5 font-japanese text-xl text-primary">響</span>
        </Link>
        <figure className="relative flex max-w-120 flex-col gap-3">
          <p
            lang="ja"
            className="font-japanese text-[28px] leading-normal font-bold"
          >
            朝は晴れていたので傘を持たずに出かけたら…
          </p>
          <figcaption className="text-[15px] text-neutral-800">
            It was sunny in the morning, so I went out without an umbrella…
          </figcaption>
        </figure>
      </aside>

      <div className="relative flex flex-col overflow-hidden">
        <span
          aria-hidden
          className="absolute -top-17.5 -right-22.5 size-60 rounded-full bg-accent-2-200 opacity-60 lg:hidden"
        />
        <span
          aria-hidden
          className="absolute top-27.5 right-15 size-16 rounded-full bg-accent-200 opacity-70 lg:hidden"
        />
        <header className="relative flex items-center gap-3 px-5 py-4.5 lg:hidden">
          <Button
            asChild
            variant="outline"
            size="icon-lg"
            shape="pill"
            className="size-11"
          >
            <Link href="/" aria-label="Back to the Hibiki home page">
              <ChevronLeft />
            </Link>
          </Button>
          <span className="font-heading text-xl">
            Hibiki
            <span className="ml-1.5 font-japanese text-sm text-primary">
              響
            </span>
          </span>
        </header>
        <main className="relative flex flex-1 flex-col px-6 pt-10 pb-7.5 lg:justify-center lg:px-16 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
