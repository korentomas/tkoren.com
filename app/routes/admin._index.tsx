import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);
  return json({ user });
}

export default function AdminIndex() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <main className="admin-shell">
      <h1>Admin</h1>
      <p className="muted">Signed in as @{user}</p>
      <nav>
        <ul>
          <li><Link to="/admin/site">Site metadata</Link></li>
          <li><Link to="/admin/interests">Interests</Link></li>
          <li><Link to="/admin/books">Books</Link></li>
          <li><Link to="/admin/now">Now</Link></li>
          <li><Link to="/admin/then">Then archive</Link></li>
          <li><Link to="/admin/images">Images</Link></li>
        </ul>
      </nav>
      <Form method="post" action="/admin/logout">
        <button type="submit">Sign out</button>
      </Form>
    </main>
  );
}
