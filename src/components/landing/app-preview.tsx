import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Mic } from "lucide-react";

export default function AppPreview() {
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
