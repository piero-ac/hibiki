import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Sentences() {
	const supabase = await createClient();
	const { data: sentences, error } = await supabase
		.from("sentences")
		.select("*");

	if (error) {
		console.log(error);
		return <p>Error loading posts.</p>;
	}

	return (
		<main>
			<h1>Sentences</h1>
			<div>
				{sentences?.map((sentence) => (
					<div key={sentence.id} className="border p-4 my-2 rounded">
						<p>{sentence.japanese_text}</p>
						<Link
							href={{
								pathname: `/protected/sentences/${sentence.id}`,
							}}
							className="text-emerald-500 hover:underline"
						>
							Practice Shadowing →
						</Link>
					</div>
				))}
			</div>
		</main>
	);
}
