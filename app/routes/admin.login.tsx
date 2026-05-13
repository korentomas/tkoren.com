import type { LoaderFunctionArgs } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import { randomBytes } from "node:crypto";
import { githubAuthorizeUrl, makeStateCookie } from "~/utils/auth.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  const state = randomBytes(16).toString("hex");
  const url = githubAuthorizeUrl(state);
  return new Response(JSON.stringify({ url }), {
    headers: { "content-type": "application/json", "set-cookie": makeStateCookie(state) },
  });
}

export default function AdminLogin() {
  const { url } = useLoaderData<typeof loader>();
  return (
    <main className="admin-shell">
      <h1>Admin sign-in</h1>
      <p>Authorize with GitHub to edit content.</p>
      <p><a href={url}><button type="button">Sign in with GitHub</button></a></p>
    </main>
  );
}
