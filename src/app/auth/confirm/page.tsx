import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server"; // Added NextResponse

export async function GET(request: NextRequest) {
	const { searchParams, origin } = new URL(request.url); // Extract origin (e.g., http://localhost:3000)
	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;

	// Fallback to /protected if no specific next destination is provided
	const next = searchParams.get("next") ?? "/protected";

	if (token_hash && type) {
		const supabase = await createClient();

		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		});

		if (!error) {
			// Safely redirect using NextResponse
			return NextResponse.redirect(`${origin}${next}`);
		} else {
			// Redirect to the template's error page with the real error message
			return NextResponse.redirect(
				`${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
			);
		}
	}

	// Redirect if someone tries to hit this route without tokens
	return NextResponse.redirect(
		`${origin}/auth/error?error=No token hash or type`,
	);
}
