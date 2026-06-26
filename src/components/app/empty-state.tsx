import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
	title: string;
	description?: string;
	icon?: React.ReactNode;
};

export function EmptyState({ title, description, icon }: EmptyStateProps) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center p-6 text-center sm:p-8">
				{icon && <div className="mb-4 text-muted-foreground">{icon}</div>}

				<h3 className="text-lg font-semibold">{title}</h3>

				{description && (
					<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
