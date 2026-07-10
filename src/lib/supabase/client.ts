import { Database } from "@/types/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
  );
}
