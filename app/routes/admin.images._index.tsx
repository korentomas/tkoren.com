import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { Form, Link, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { listDirectory, deleteFile } from "~/utils/github.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const files = await listDirectory("public/uploads");
  return json({ files });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const fd = await request.formData();
  const intent = fd.get("intent");
  if (intent === "delete") {
    const name = String(fd.get("name"));
    if (!name || name.includes("/") || name.includes("..")) {
      return json({ ok: false, error: "Invalid filename" }, { status: 400 });
    }
    await deleteFile({ path: `public/uploads/${name}`, message: `cms: delete ${name}` });
    return json({ ok: true });
  }
  return json({ ok: false, error: "Unknown intent" }, { status: 400 });
}

export default function AdminImages() {
  const { files } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  return (
    <main className="admin-shell">
      <p><Link to="/admin">← Admin</Link></p>
      <h1>Images</h1>
      <p><Link to="/admin/images/upload" className="button-link">Upload new image</Link></p>
      <ul>
        {files.map((f) => (
          <li key={f.name} style={{ marginBottom: "0.5rem" }}>
            <code>/uploads/{f.name}</code>{" "}
            <Form method="post" style={{ display: "inline" }}>
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="name" value={f.name} />
              <button type="submit" disabled={nav.state === "submitting"}>Delete</button>
            </Form>
          </li>
        ))}
      </ul>
      {result?.ok && <p className="success">Deleted. Live in ~30s.</p>}
      {result && !result.ok && <p className="error">{(result as any).error}</p>}
    </main>
  );
}
