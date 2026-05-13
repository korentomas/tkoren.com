import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { z } from "zod";
import { requireAdmin } from "~/utils/auth.server";
import { BookSectionSchema } from "~/utils/schemas";
import { BOOKS } from "~/utils/site-config";
import { commitJsonFile } from "~/utils/github.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ books: BOOKS });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const fd = await request.formData();
  const rawJson = String(fd.get("json") ?? "");
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    return json({ ok: false, error: "Invalid JSON in textarea" }, { status: 400 });
  }
  const parsed = z.array(BookSectionSchema).safeParse(parsedJson);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.format() }, { status: 400 });
  await commitJsonFile({ path: "content/books.json", data: parsed.data, message: "cms: update books via /admin" });
  return json({ ok: true });
}

export default function AdminBooks() {
  const { books } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";
  return (
    <main className="admin-shell">
      <p><Link to="/admin">← Admin</Link></p>
      <h1>Books</h1>
      <p className="muted">Edit the JSON directly. Validation runs before save.</p>
      <Form method="post">
        <div className="field">
          <label htmlFor="json">books.json</label>
          <textarea id="json" name="json" rows={28} defaultValue={JSON.stringify(books, null, 2)} />
        </div>
        <div className="save-row">
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</button>
          {result?.ok && <span className="success">Saved. Live in ~30s.</span>}
          {result && !result.ok && <span className="error">Validation failed: {(result as any).error ?? "see field errors"}</span>}
        </div>
      </Form>
    </main>
  );
}
