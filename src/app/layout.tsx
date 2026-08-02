import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-variable.ttf",
  variable: "--font-mono",
  weight: "100 800",
  display: "swap",
});

export const metadata = {
  title: "Hibiki",
  description: "Japanese shadowing and pronunciation practice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "scroll-smooth",
        "font-mono",
        jetbrainsMono.variable,
        "dark",
      )}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
