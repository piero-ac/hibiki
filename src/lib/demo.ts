import { serverEnv } from "./server-env";

export function isDemoUser(email?: string | null) {
  return email === serverEnv.demoUserEmail;
}
