import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<main className="flex min-h-[calc(100vh-4rem)] flex-col bg-background px-4 py-4 text-foreground sm:px-6 lg:px-8">
			<section className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
				<div className="mb-3 flex items-center justify-between">
					<Button variant="ghost" size="sm" disabled>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Sentences
					</Button>
				</div>

				<Card className="flex min-h-0 flex-1 flex-col shadow-sm">
					<CardHeader className="space-y-4 text-center">
						<div className="flex items-center justify-center gap-2">
							<Badge variant="secondary">
								<Skeleton className="h-4 w-8" />
							</Badge>

							<Badge variant="outline">
								<Skeleton className="h-4 w-20" />
							</Badge>
						</div>

						<div className="mx-auto w-full max-w-4xl space-y-3">
							<Skeleton className="mx-auto h-12 w-full" />
							<Skeleton className="mx-auto h-12 w-5/6" />
						</div>

						<div className="mx-auto w-full max-w-2xl space-y-2">
							<Skeleton className="mx-auto h-5 w-full" />
							<Skeleton className="mx-auto h-5 w-3/4" />
						</div>
					</CardHeader>

					<CardContent className="flex min-h-0 flex-1 items-center justify-center">
						<div className="w-full max-w-2xl space-y-4">
							<div className="grid gap-3 sm:grid-cols-2">
								<Skeleton className="h-14 w-full" />
								<Skeleton className="h-14 w-full" />
							</div>

							<div className="space-y-4 rounded-2xl border bg-muted/40 p-4">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-10 w-full" />

								<div className="grid gap-3 sm:grid-cols-2">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
