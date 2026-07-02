import SignUpForm from "@/components/auth/sign-up-form";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
	// disable public signup entirely for V1
	redirect("/");

	const supabase = await createClient();
	const { data } = await supabase.auth.getClaims();

	if (data?.claims) {
		redirect("/protected");
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<SignUpForm />
			</div>
		</div>
	);
}
