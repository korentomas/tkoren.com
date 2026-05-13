import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { z } from "zod";
import { requireAdmin } from "~/utils/auth.server";
import { InterestSchema } from "~/utils/schemas";
import { INTERESTS } from "~/utils/site-config";
import { commitJsonFile } from "~/utils/github.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ interests: INTERESTS });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const fd = await request.formData();
  const titles = fd.getAll("title").map(String);
  const bodies = fd.getAll("body").map(String);
  if (titles.length !== bodies.length) {
    return json({ ok: false, error: "Form mismatch" }, { status: 400 });
  }
  const list = titles.map((t, i) => ({ title: t, body: bodies[i] }))
    .filter((it) => it.title.trim() || it.body.trim());
  const parsed = z.array(InterestSchema).safeParse(list);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.format() }, { status: 400 });
  await commitJsonFile({ path: "content/interests.json", data: parsed.data, message: "cms: update interests via /admin" });
  return json({ ok: true });
}

export default function AdminInterests() {
  const { interests } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";
  const rows = interests.length > 0 ? interests : [{ title: "", body: "" }];
  return (
    <main className="admin-shell">
      <p><Link to="/admin">← Admin</Link></p>
      <h1>Interests</h1>
      <Form method="post" id="interests-form">
        {rows.map((it, i) => (
          <fieldset key={i} style={{ marginBottom: "1rem" }}>
            <div className="field">
              <label>title</label>
              <input name="title" defaultValue={it.title} />
            </div>
            <div className="field">
              <label>body</label>
              <textarea name="body" defaultValue={it.body} />
            </div>
          </fieldset>
        ))}
        <div className="save-row">
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</button>
          {result?.ok && <span className="success">Saved. Live in ~30s.</span>}
          {result && !result.ok && <span className="error">Validation failed.</span>}
        </div>
      </Form>
      <Form method="post" action="/admin/interests/add">
        <button type="submit">Add empty row</button>
      </Form>
    </main>
  );
}
