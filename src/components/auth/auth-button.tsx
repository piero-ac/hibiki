import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (user) {
    return <LogoutButton />;
  }

  return (
    <Button asChild variant="outline" size="sm" shape="pill">
      <Link href="/auth/login">Log in</Link>
    </Button>
  );
}
