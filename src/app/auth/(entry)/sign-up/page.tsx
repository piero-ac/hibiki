import SignUpForm from "@/components/auth/sign-up-form";
import { redirect } from "next/navigation";
import { PUBLIC_SIGN_UP_ENABLED } from "@/lib/auth/sign-up";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  if (!PUBLIC_SIGN_UP_ENABLED) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/protected");
  }

  return <SignUpForm />;
}
