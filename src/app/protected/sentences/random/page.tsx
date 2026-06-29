import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RandomSentencePage() {
	const supabase = await createClient();

	const { data: sentences } = await supabase.from("sentences").select("id");

	if (!sentences?.length) {
		redirect("/protected/sentences");
	}

	const random = sentences[Math.floor(Math.random() * sentences.length)];

	redirect(`/protected/sentences/${random.id}`);
}
