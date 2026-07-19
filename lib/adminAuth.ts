import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "facemood_admin_session";
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("서버에 ADMIN_SESSION_SECRET이 설정되어 있지 않습니다.");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  return (
    timingSafeEqualStrings(username, expectedUsername) &&
    timingSafeEqualStrings(password, expectedPassword)
  );
}

// Stateless signed session token — "<issuedAtMs>.<hmac>". Verifying just
// means recomputing the HMAC and checking the token hasn't expired, so
// there's no session store to manage for what's a single-admin tool.
export function createAdminSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  if (!timingSafeEqualStrings(signature, sign(issuedAt))) return false;

  const issuedMs = Number(issuedAt);
  if (!Number.isFinite(issuedMs)) return false;
  const ageSeconds = (Date.now() - issuedMs) / 1000;
  return ageSeconds >= 0 && ageSeconds <= ADMIN_COOKIE_MAX_AGE_SECONDS;
}
