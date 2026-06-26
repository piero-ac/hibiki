type SectionHeaderProps = {
	title: string;
	description?: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
	return (
		<div className="space-y-1 sm:space-y-2">
			<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
				{title}
			</h2>

			{description && (
				<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
					{description}
				</p>
			)}
		</div>
	);
}
