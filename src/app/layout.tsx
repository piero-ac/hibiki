import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // Make sure your Tailwind styles import matches your file structure

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "Hibiki",
	description: "A full-stack Next.js and Supabase application",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="scroll-smooth">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen`}
			>
				{children}
			</body>
		</html>
	);
}
