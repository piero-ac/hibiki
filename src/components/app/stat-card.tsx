import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
	label: string;
	value: string | number;
	emoji: string;
};

export function StatCard({ label, value, emoji }: StatCardProps) {
	return (
		<Card>
			<CardContent className="p-5 sm:p-6">
				<p className="flex items-center gap-2 text-sm text-muted-foreground">
					<span>{emoji}</span>
					<span>{label}</span>
				</p>
				<p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
					{value}
				</p>
			</CardContent>
		</Card>
	);
}
