import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const next = searchParams.get("next");
  const redirectTo =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/protected";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    } else {
      console.error("Auth confirmation failed:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?code=invalid_or_expired_link`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?code=missing_auth_token`);
}
