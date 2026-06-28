import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-12">
				<nav className="flex items-center justify-between">
					<Link href="/" className="text-xl font-bold tracking-tight">
						Hibiki
					</Link>

					<Suspense
						fallback={
							<div className="text-sm text-muted-foreground">Loading...</div>
						}
					>
						<AuthButton />
					</Suspense>
				</nav>

				<section className="flex flex-1 flex-col items-center justify-center gap-12 py-16 text-center lg:flex-row lg:justify-between lg:py-24 lg:text-left">
					<div className="max-w-2xl">
						<p className="mb-5 inline-flex rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground">
							AI-powered Japanese shadowing practice
						</p>

						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							Improve your Japanese pronunciation with focused shadowing.
						</h1>

						<p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
							Practice N2 and N1 sentences, record your voice, receive AI
							transcription feedback, and track your improvement over time.
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
							<Button asChild size="lg">
								<Link href="/signup">Create free account</Link>
							</Button>

							<Button asChild variant="outline" size="lg">
								<Link href="/login">Log in</Link>
							</Button>
						</div>
					</div>

					<Card className="w-full max-w-md text-left shadow-sm">
						<CardHeader>
							<CardTitle>How Hibiki works</CardTitle>
							<CardDescription>
								A simple loop for pronunciation practice.
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-4">
							<Step
								emoji="🎧"
								title="Listen"
								text="Hear the target sentence."
							/>
							<Step emoji="🎙️" title="Shadow" text="Record your own attempt." />
							<Step
								emoji="🤖"
								title="Compare"
								text="AI transcribes your speech and checks accuracy."
							/>
							<Step
								emoji="📈"
								title="Improve"
								text="Review your attempts and track progress."
							/>
						</CardContent>
					</Card>
				</section>

				<Separator />

				<section className="py-16">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							Built for serious Japanese learners.
						</h2>
						<p className="mt-4 text-muted-foreground">
							Hibiki focuses on advanced learners who want practical speaking
							repetition, not beginner flashcards.
						</p>
					</div>

					<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<FeatureCard
							emoji="🎌"
							title="Curated N2/N1 practice"
							description="Practice advanced Japanese sentences designed for learners preparing for higher-level fluency."
						/>

						<FeatureCard
							emoji="🎤"
							title="Speech recording"
							description="Record yourself shadowing each sentence and build real speaking confidence through repetition."
						/>

						<FeatureCard
							emoji="📊"
							title="Progress tracking"
							description="See your attempts, accuracy scores, and improvement history in one place."
						/>
					</div>
				</section>

				<section className="pb-16">
					<Card className="mx-auto max-w-3xl text-center shadow-sm">
						<CardHeader>
							<CardTitle className="text-2xl sm:text-3xl">
								Ready to improve your pronunciation?
							</CardTitle>
							<CardDescription>
								Start practicing Japanese shadowing one sentence at a time.
							</CardDescription>
						</CardHeader>

						<CardContent>
							<Button asChild size="lg">
								<Link href="/signup">Get started</Link>
							</Button>
						</CardContent>
					</Card>
				</section>
			</div>
		</main>
	);
}

function Step({
	emoji,
	title,
	text,
}: {
	emoji: string;
	title: string;
	text: string;
}) {
	return (
		<div className="flex gap-4 rounded-xl border bg-muted/40 p-4">
			<div className="text-2xl">{emoji}</div>

			<div>
				<h3 className="font-semibold">{title}</h3>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
			</div>
		</div>
	);
}

function FeatureCard({
	emoji,
	title,
	description,
}: {
	emoji: string;
	title: string;
	description: string;
}) {
	return (
		<Card className="shadow-sm">
			<CardHeader>
				<div className="text-3xl">{emoji}</div>
				<CardTitle className="text-lg">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
		</Card>
	);
}
