function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const serverEnv = {
  openaiApiKey: requireEnv(process.env.OPENAI_API_KEY, "OPENAI_API_KEY"),
  demoUserEmail: process.env.DEMO_USER_EMAIL,
  demoUserPassword: process.env.DEMO_USER_PASSWORD,
};
