import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/server-runtime";
import { clearSessionCookie, isHttps } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  return new Response(null, {
    status: 302,
    headers: { location: "/admin/login", "set-cookie": clearSessionCookie(isHttps(request)) },
  });
}

export async function loader(_: LoaderFunctionArgs) {
  return redirect("/admin/login");
}
