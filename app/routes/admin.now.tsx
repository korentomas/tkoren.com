import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { NowSnapshotSchema } from "~/utils/schemas";
import { NOW, THEN } from "~/utils/site-config";
import { commitJsonFile } from "~/utils/github.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ now: NOW });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const fd = await request.formData();
  const intent = fd.get("intent");

  if (intent === "snapshot-to-then") {
    const nextThen = [NOW, ...THEN];
    await commitJsonFile({ path: "content/then.json", data: nextThen, message: "cms: archive current /now to /then" });
    return json({ ok: true, archived: true });
  }

  const raw = String(fd.get("json") ?? "");
  let parsedJson: unknown;
  try { parsedJson = JSON.parse(raw); } catch {
    return json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = NowSnapshotSchema.safeParse(parsedJson);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.format() }, { status: 400 });
  await commitJsonFile({ path: "content/now.json", data: parsed.data, message: "cms: update /now" });
  return json({ ok: true });
}

export default function AdminNow() {
  const { now } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";
  return (
    <main className="admin-shell">
      <p><Link to="/admin">← Admin</Link></p>
      <h1>Now</h1>
      <Form method="post">
        <input type="hidden" name="intent" value="save" />
        <div className="field">
          <label htmlFor="json">now.json</label>
          <textarea id="json" name="json" rows={24} defaultValue={JSON.stringify(now, null, 2)} />
        </div>
        <div className="save-row">
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</button>
          {result?.ok && !("archived" in result) && <span className="success">Saved. Live in ~30s.</span>}
          {result && !result.ok && <span className="error">Validation failed.</span>}
        </div>
      </Form>
      <hr />
      <Form method="post">
        <input type="hidden" name="intent" value="snapshot-to-then" />
        <button type="submit">Archive current /now → /then</button>
      </Form>
      {result && "archived" in result && <p className="success">Archived. Update /now next.</p>}
    </main>
  );
}
