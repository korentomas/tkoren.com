import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { z } from "zod";
import { requireAdmin } from "~/utils/auth.server";
import { NowSnapshotSchema } from "~/utils/schemas";
import { THEN } from "~/utils/site-config";
import { commitJsonFile } from "~/utils/github.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ then: THEN });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const fd = await request.formData();
  const raw = String(fd.get("json") ?? "");
  let parsedJson: unknown;
  try { parsedJson = JSON.parse(raw); } catch {
    return json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = z.array(NowSnapshotSchema).safeParse(parsedJson);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.format() }, { status: 400 });
  await commitJsonFile({ path: "content/then.json", data: parsed.data, message: "cms: update /then archive" });
  return json({ ok: true });
}

export default function AdminThen() {
  const { then } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";
  return (
    <main className="admin-shell">
      <p><Link to="/admin">← Admin</Link></p>
      <h1>Then archive</h1>
      <p className="muted">{then.length} snapshot(s).</p>
      <Form method="post">
        <div className="field">
          <label htmlFor="json">then.json</label>
          <textarea id="json" name="json" rows={28} defaultValue={JSON.stringify(then, null, 2)} />
        </div>
        <div className="save-row">
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</button>
          {result?.ok && <span className="success">Saved. Live in ~30s.</span>}
          {result && !result.ok && <span className="error">Validation failed.</span>}
        </div>
      </Form>
    </main>
  );
}
