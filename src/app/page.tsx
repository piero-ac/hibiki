import Link from "next/link";
import { Suspense } from "react";
import {
	BarChart3,
	BookOpenText,
	Brain,
	CheckCircle2,
	Headphones,
	Mic,
	Sparkles,
} from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
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
					<Link href="/" className="group">
						<p className="text-xl font-bold tracking-tight">Hibiki</p>
						<p className="text-xs text-muted-foreground">ひびき · 響</p>
					</Link>

					<Suspense
						fallback={
							<div className="text-sm text-muted-foreground">Loading...</div>
						}
					>
						<AuthButton showOpenApp={true} />
					</Suspense>
				</nav>

				<section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
					<div className="text-center lg:text-left">
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
							<Sparkles className="h-4 w-4" />
							AI-powered Japanese shadowing practice
						</div>

						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							Shadow. Speak. Improve your Japanese.
						</h1>

						<p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
							Practice advanced N2 and N1 sentences, record your voice, compare
							your speech with AI transcription, and track your pronunciation
							progress over time.
						</p>

						<div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-center lg:justify-start">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4" />
								<span>Built for N2/N1 learners</span>
							</div>

							<div className="hidden h-1 w-1 rounded-full bg-muted-foreground sm:block" />

							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4" />
								<span>Practice from any device</span>
							</div>
						</div>
					</div>

					<AppPreview />
				</section>

				<Separator />

				<section className="py-16">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							A simple loop for better pronunciation.
						</h2>
						<p className="mt-4 text-muted-foreground">
							Hibiki keeps practice focused: listen carefully, shadow out loud,
							compare your attempt, and improve through repetition.
						</p>
					</div>

					<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<ProcessCard
							icon={<Headphones className="h-5 w-5" />}
							title="Listen"
							description="Hear the target Japanese sentence."
						/>

						<ProcessCard
							icon={<Mic className="h-5 w-5" />}
							title="Shadow"
							description="Record yourself speaking out loud."
						/>

						<ProcessCard
							icon={<Brain className="h-5 w-5" />}
							title="Compare"
							description="AI transcribes and checks your attempt."
						/>

						<ProcessCard
							icon={<BarChart3 className="h-5 w-5" />}
							title="Improve"
							description="Track attempts, scores, and progress."
						/>
					</div>
				</section>

				<section className="pb-16">
					<div className="grid gap-4 lg:grid-cols-3">
						<FeatureCard
							icon={<BookOpenText className="h-6 w-6" />}
							title="Curated advanced sentences"
							description="Practice with focused N2 and N1 Japanese sentences instead of beginner material you already know."
						/>

						<FeatureCard
							icon={<Mic className="h-6 w-6" />}
							title="Real speaking practice"
							description="Move beyond passive study by recording yourself, shadowing aloud, and building speaking confidence."
						/>

						<FeatureCard
							icon={<BarChart3 className="h-6 w-6" />}
							title="Progress you can see"
							description="Review your history, scores, and repeated attempts so improvement feels measurable."
						/>
					</div>
				</section>
			</div>
		</main>
	);
}

function AppPreview() {
	return (
		<Card className="mx-auto w-full max-w-md overflow-hidden shadow-lg">
			<CardHeader className="border-b bg-muted/40">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">Practice Session</CardTitle>
						<CardDescription>N2 · Confidence</CardDescription>
					</div>

					<div className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
						Attempt 14
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-5 p-6">
				<div className="rounded-2xl border bg-background p-5">
					<p className="text-sm text-muted-foreground">Target sentence</p>
					<p className="mt-3 text-xl font-semibold leading-relaxed">
						努力を続ければ、少しずつ自信がついてくる。
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						If you keep making an effort, you&apos;ll gradually gain confidence.
					</p>
				</div>

				<div className="rounded-2xl border bg-muted/40 p-5">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
								<Mic className="h-4 w-4" />
							</div>
							<div>
								<p className="text-sm font-medium">Recording complete</p>
								<p className="text-xs text-muted-foreground">
									AI transcription ready
								</p>
							</div>
						</div>

						<p className="text-2xl font-bold">92%</p>
					</div>

					<div className="h-2 overflow-hidden rounded-full bg-background">
						<div className="h-full w-[92%] rounded-full bg-primary" />
					</div>
				</div>

				<div className="grid grid-cols-3 gap-3">
					<PreviewStat label="Score" value="92%" />
					<PreviewStat label="Level" value="N2" />
					<PreviewStat label="Streak" value="5d" />
				</div>
			</CardContent>
		</Card>
	);
}

function PreviewStat({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl border bg-background p-3 text-center">
			<p className="font-bold">{value}</p>
			<p className="mt-1 text-xs text-muted-foreground">{label}</p>
		</div>
	);
}

function ProcessCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<Card className="shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
			<CardHeader>
				<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
					{icon}
				</div>
				<CardTitle className="text-lg">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
		</Card>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<Card className="shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
			<CardHeader>
				<div className="mb-3 text-primary">{icon}</div>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
		</Card>
	);
}
