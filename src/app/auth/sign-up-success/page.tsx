export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Thank you for signing up!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Check your email to confirm
              </p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
