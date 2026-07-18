import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const LOCAL_USERS = [
  { email: "alice@hibiki.local", password: "HibikiLocal123!" },
  { email: "bob@hibiki.local", password: "HibikiLocal123!" },
  { email: "demo@hibiki.local", password: "HibikiLocal123!" },
];

const status = parseEnvOutput(
  execFileSync("npx", ["supabase", "status", "-o", "env"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }),
);

const apiUrl = status.API_URL;
const serviceRoleKey = status.SERVICE_ROLE_KEY;

if (!apiUrl || !serviceRoleKey) {
  throw new Error(
    "Local Supabase is missing API_URL or SERVICE_ROLE_KEY. Run `npx supabase start` first.",
  );
}

const hostname = new URL(apiUrl).hostname;
if (
  hostname !== "127.0.0.1" &&
  hostname !== "localhost" &&
  hostname !== "::1"
) {
  throw new Error(`Refusing to seed a non-local Supabase URL: ${apiUrl}`);
}

const supabase = createClient(apiUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data: existingUsers, error: listError } =
  await supabase.auth.admin.listUsers({ perPage: 1000 });

if (listError) throw listError;

for (const localUser of LOCAL_USERS) {
  if (existingUsers.users.some((user) => user.email === localUser.email)) {
    console.log(`User already exists: ${localUser.email}`);
    continue;
  }

  const { error } = await supabase.auth.admin.createUser({
    email: localUser.email,
    password: localUser.password,
    email_confirm: true,
  });

  if (error) throw error;
  console.log(`Created local user: ${localUser.email}`);
}

const attemptsSql = readFileSync("supabase/dev/fake_attempts.sql", "utf8");
const sqlResult = spawnSync(
  "docker",
  [
    "exec",
    "-i",
    "supabase_db_hibiki-nextjs-supabase",
    "psql",
    "-v",
    "ON_ERROR_STOP=1",
    "-U",
    "postgres",
    "-d",
    "postgres",
  ],
  {
    input: attemptsSql,
    encoding: "utf8",
    stdio: ["pipe", "inherit", "inherit"],
  },
);

if (sqlResult.status !== 0) {
  throw new Error("Failed to load local fake attempts.");
}

console.log("Local users and attempts are ready.");

function parseEnvOutput(output) {
  return Object.fromEntries(
    output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator);
        const value = line.slice(separator + 1).replace(/^"|"$/g, "");
        return [key, value];
      }),
  );
}
