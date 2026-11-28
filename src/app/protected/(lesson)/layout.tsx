// The Lesson player: no app navbar, tab bar or footer. Its own top bar and
// mobile tray are the only ways out, and they confirm before leaving.
export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      {children}
    </main>
  );
}
