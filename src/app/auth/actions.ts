"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/server-env";

export async function signInDemoUser() {
  const supabase = await createClient();

  const email = serverEnv.demoUserEmail;
  const password = serverEnv.demoUserPassword;

  if (!email || !password) {
    throw new Error("Demo credentials are not configured.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Could not sign in demo user.");
  }

  redirect("/protected");
}
