import { execFileSync } from "node:child_process";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    supabaseUrl: string;
    supabasePublishableKey: string;
    supabaseServiceRoleKey: string;
  }
}

/**
 * Reads the local Supabase credentials once and hands them to the tests.
 * Refuses to run against anything that isn't on this machine, because the
 * tests create and delete Learners with the service role key.
 */
export default function setup(project: TestProject) {
  let output: string;
  try {
    output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    throw new Error(
      "Local Supabase isn't running. Start it with `npx supabase start` before `npm run test:integration`.",
    );
  }

  const status = parseEnvOutput(output);
  const url = status.API_URL;
  const publishableKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
  const serviceRoleKey = status.SERVICE_ROLE_KEY;

  if (!url || !publishableKey || !serviceRoleKey) {
    throw new Error(
      "Local Supabase status is missing API_URL, PUBLISHABLE_KEY or SERVICE_ROLE_KEY.",
    );
  }

  const hostname = new URL(url).hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(hostname)) {
    throw new Error(`Refusing to run integration tests against ${url}`);
  }

  project.provide("supabaseUrl", url);
  project.provide("supabasePublishableKey", publishableKey);
  project.provide("supabaseServiceRoleKey", serviceRoleKey);
}

function parseEnvOutput(output: string): Record<string, string> {
  return Object.fromEntries(
    output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^"|"$/g, ""),
        ];
      }),
  );
}
