import { PageContainer } from "@/components/app/page-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<PageContainer>
			<div className="space-y-8 sm:space-y-10">
				{/* Header */}
				<div className="space-y-3">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-5 w-80 max-w-full" />
				</div>

				{/* Progress Overview */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<Card key={index}>
							<CardContent className="space-y-3 p-6">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-4 w-28" />
							</CardContent>
						</Card>
					))}
				</div>

				{/* Sentence Performance */}
				<div className="grid gap-6 lg:grid-cols-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<Card key={index}>
							<CardHeader className="space-y-2">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-4 w-56" />
							</CardHeader>

							<CardContent className="space-y-3">
								{Array.from({ length: 5 }).map((_, row) => (
									<div key={row} className="flex items-center justify-between">
										<Skeleton className="h-5 w-48" />
										<Skeleton className="h-5 w-12" />
									</div>
								))}
							</CardContent>
						</Card>
					))}
				</div>

				{/* Recent Attempts */}
				<Card>
					<CardHeader className="space-y-2">
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-4 w-64" />
					</CardHeader>

					<CardContent className="space-y-4">
						{Array.from({ length: 6 }).map((_, index) => (
							<div
								key={index}
								className="flex items-center justify-between border-b pb-4 last:border-0"
							>
								<div className="space-y-2">
									<Skeleton className="h-5 w-56" />
									<Skeleton className="h-4 w-32" />
								</div>

								<Skeleton className="h-7 w-16 rounded-full" />
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	);
}
