import { PageContainer } from "@/components/app/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<PageContainer>
			<div className="space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-3">
						<Skeleton className="h-10 w-72" />
						<Skeleton className="h-5 w-96 max-w-full" />
					</div>

					<Badge variant="secondary" className="w-fit">
						<Skeleton className="h-4 w-20" />
					</Badge>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 9 }).map((_, index) => (
						<Card key={index} className="flex flex-col shadow-sm">
							<CardHeader className="space-y-3">
								<div className="flex flex-wrap items-center gap-2">
									<Skeleton className="h-6 w-12 rounded-full" />
									<Skeleton className="h-6 w-24 rounded-full" />
									<Skeleton className="ml-auto h-6 w-28 rounded-full" />
								</div>

								<div className="space-y-2">
									<Skeleton className="h-7 w-full" />
									<Skeleton className="h-7 w-5/6" />
									<Skeleton className="h-7 w-2/3" />
								</div>

								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
								</div>
							</CardHeader>

							<CardFooter className="mt-auto">
								<Skeleton className="h-10 w-full" />
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</PageContainer>
	);
}
