/**
 * Demo-only password hashing: SHA-256 hex, no salt.
 *
 * This is NOT production-safe — the hash lives in localStorage, which anyone
 * on the device can read and brute-force offline, and unsalted SHA-256 is fast.
 * It exists only so the front-only phase can validate a login without storing
 * plaintext. Replace with Supabase Auth (server-side, salted, rate-limited)
 * before any real credential ever touches this app.
 */
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}
