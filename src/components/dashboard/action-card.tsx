import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ActionCard({
	icon,
	title,
	description,
	href,
	buttonText,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	href: string;
	buttonText: string;
}) {
	return (
		<Card className="flex flex-col transition-all hover:-translate-y-1 hover:shadow-md">
			<CardHeader>
				<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
					{icon}
				</div>

				<CardTitle>{title}</CardTitle>

				<CardDescription>{description}</CardDescription>
			</CardHeader>

			<CardFooter className="mt-auto">
				<Button asChild variant="outline" className="w-full">
					<Link href={href}>{buttonText}</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
