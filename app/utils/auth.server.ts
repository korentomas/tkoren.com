import { redirect } from "@remix-run/server-runtime";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session.server";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    const [k, ...rest] = part.split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function requireAdmin(request: Request): Promise<string> {
  const secret = getEnv("SESSION_SECRET");
  const allowed = getEnv("ADMIN_GH_USERNAME");
  const cookie = parseCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!cookie) throw redirect("/admin/login");
  const payload = verifySession(cookie, secret);
  if (!payload || payload.user !== allowed) throw redirect("/admin/login");
  return payload.user;
}

export function makeSessionCookie(user: string, secure: boolean): string {
  const secret = getEnv("SESSION_SECRET");
  const token = signSession({ user }, secret, SESSION_TTL_SECONDS);
  const attrs = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  return attrs.join("; ");
}

export function clearSessionCookie(secure: boolean): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=0`;
}

// --- OAuth helpers ---

export function githubAuthorizeUrl(state: string): string {
  const clientId = getEnv("GITHUB_CLIENT_ID");
  const params = new URLSearchParams({ client_id: clientId, scope: "", state });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForUser(code: string): Promise<string> {
  const clientId = getEnv("GITHUB_CLIENT_ID");
  const clientSecret = getEnv("GITHUB_CLIENT_SECRET");

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  if (!tokenRes.ok) throw new Error(`OAuth token exchange failed: ${tokenRes.status}`);
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const token = tokenJson.access_token;
  if (!token) throw new Error("OAuth token exchange returned no access_token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
  });
  if (!userRes.ok) throw new Error(`GitHub /user failed: ${userRes.status}`);
  const userJson = (await userRes.json()) as { login?: string };
  if (!userJson.login) throw new Error("GitHub /user returned no login");
  return userJson.login;
}

// --- CSRF state cookie helpers ---

const STATE_COOKIE = "tk_admin_oauth_state";

export function makeStateCookie(state: string, secure: boolean): string {
  return `${STATE_COOKIE}=${state}; Path=/admin; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=600`;
}

export function readStateCookie(request: Request): string | null {
  return parseCookie(request.headers.get("cookie"), STATE_COOKIE);
}

export function clearStateCookie(secure: boolean): string {
  return `${STATE_COOKIE}=; Path=/admin; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=0`;
}

export function isHttps(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}
