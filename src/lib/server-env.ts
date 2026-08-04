import { requireEnv } from "@/lib/require-env";

export const serverEnv = {
  openaiApiKey: requireEnv(process.env.OPENAI_API_KEY, "OPENAI_API_KEY"),
  demoUserEmail: process.env.DEMO_USER_EMAIL,
  demoUserPassword: process.env.DEMO_USER_PASSWORD,
};
