import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
	const supabase = await createClient();

	const { data } = await supabase.auth.getClaims();
	const user = data?.claims;

	if (user) {
		return (
			<div className="flex items-center gap-2">
				<Button asChild variant="outline" size="sm">
					<Link href="/protected">Open App</Link>
				</Button>

				<LogoutButton />
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button asChild variant="outline" size="sm">
				<Link href="/auth/login">Log in</Link>
			</Button>

			<Button asChild size="sm">
				<Link href="/auth/sign-up">Sign up</Link>
			</Button>
		</div>
	);
}
