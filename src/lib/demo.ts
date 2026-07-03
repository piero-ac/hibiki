export function isDemoUser(email?: string | null) {
  return email === process.env.DEMO_USER_EMAIL;
}
