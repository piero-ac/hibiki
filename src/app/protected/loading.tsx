import { PageContainer } from "@/components/app/page-container";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<PageContainer>
			<div className="space-y-8">
				<Card>
					<CardHeader className="space-y-4">
						<Skeleton className="h-6 w-36" />
						<div className="space-y-3">
							<Skeleton className="h-10 w-64" />
							<Skeleton className="h-5 w-full max-w-2xl" />
							<Skeleton className="h-5 w-80 max-w-full" />
						</div>
					</CardHeader>

					<CardContent>
						<Skeleton className="h-11 w-64" />
					</CardContent>
				</Card>

				<div className="grid gap-4 md:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<Card key={index} className="flex flex-col">
							<CardHeader className="space-y-3">
								<Skeleton className="h-10 w-10 rounded-xl" />
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-4/5" />
							</CardHeader>

							<CardFooter className="mt-auto">
								<Skeleton className="h-10 w-full" />
							</CardFooter>
						</Card>
					))}
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-7 w-40" />
						<Skeleton className="h-4 w-64" />
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<Card key={index}>
								<CardContent className="p-6">
									<Skeleton className="h-8 w-16" />
									<Skeleton className="mt-3 h-4 w-24" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
