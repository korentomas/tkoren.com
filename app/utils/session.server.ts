import { createHmac, timingSafeEqual } from "node:crypto";

type Payload = { user: string };
type SignedPayload = Payload & { exp: number };

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function hmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function signSession(payload: Payload, secret: string, ttlSeconds: number): string {
  const signed: SignedPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = b64url(JSON.stringify(signed));
  const sig = hmac(body, secret);
  return `${body}.${sig}`;
}

export function verifySession(token: string, secret: string): Payload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = hmac(body, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedPayload;
    if (typeof parsed.exp !== "number" || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return { user: parsed.user };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "tk_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
