import type { LoaderFunctionArgs } from "@vercel/remix";
import {
  exchangeCodeForUser,
  makeSessionCookie,
  readStateCookie,
  clearStateCookie,
} from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = readStateCookie(request);

  if (!code || !state || !expected || state !== expected) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  const allowed = process.env.ADMIN_GH_USERNAME;
  const login = await exchangeCodeForUser(code);
  if (login !== allowed) {
    return new Response("Not authorized", { status: 403 });
  }

  const headers = new Headers();
  headers.append("set-cookie", makeSessionCookie(login));
  headers.append("set-cookie", clearStateCookie());
  headers.set("location", "/admin");
  return new Response(null, { status: 302, headers });
}
