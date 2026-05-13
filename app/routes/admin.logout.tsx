import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/server-runtime";
import { clearSessionCookie } from "~/utils/auth.server";

export async function action(_: ActionFunctionArgs) {
  return new Response(null, {
    status: 302,
    headers: { location: "/admin/login", "set-cookie": clearSessionCookie() },
  });
}

export async function loader(_: LoaderFunctionArgs) {
  return redirect("/admin/login");
}
