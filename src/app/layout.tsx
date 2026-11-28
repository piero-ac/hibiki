import { Caprasimo, Figtree, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const caprasimo = Caprasimo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caprasimo",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

// Japanese glyphs come in many unicode-range slices, so nothing is preloaded:
// the browser fetches only the slices a Sentence actually uses.
const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  variable: "--font-zen-maru-gothic",
  display: "swap",
  preload: false,
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
        caprasimo.variable,
        figtree.variable,
        zenMaruGothic.variable,
      )}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
