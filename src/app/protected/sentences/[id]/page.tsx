import { createClient } from "@/lib/supabase/server";
interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function ShadowingPage({ params }: PageProps) {
	const { id } = await params;
	const supabase = await createClient();

	const { data: sentence, error } = await supabase
		.from("sentences")
		.select("*")
		.eq("id", id)
		.single();

	if (error || !sentence) {
		return <main className="p-6 text-red-500">Sentence not found.</main>;
	}

	return (
		<div>
			ShadowingPage
			<p>{id}</p>
			<p>{sentence.japanese_text}</p>
		</div>
	);
}
