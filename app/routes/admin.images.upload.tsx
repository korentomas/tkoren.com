import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@vercel/remix";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { commitBinaryFile } from "~/utils/github.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 5 * 1024 * 1024;

function baseSlug(name: string): string {
  // Strip extension, lowercase, keep only a-z 0-9, collapse separators to single -, trim hyphens.
  const noExt = name.replace(/\.[^.]+$/, "");
  return noExt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const uploadHandler = unstable_createMemoryUploadHandler({ maxPartSize: MAX_BYTES });
  const fd = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = fd.get("file");
  if (!(file instanceof File)) return json({ ok: false, error: "No file" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return json({ ok: false, error: `MIME not allowed: ${file.type}` }, { status: 400 });
  if (file.size > MAX_BYTES) return json({ ok: false, error: "Too large (max 5 MB)" }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  const slug = baseSlug(file.name) || "upload";
  const ext = MIME_TO_EXT[file.type];
  const filename = `${today}-${slug}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const b64 = Buffer.from(bytes).toString("base64");

  await commitBinaryFile({
    path: `public/uploads/${filename}`,
    contentBase64: b64,
    message: `cms: upload ${filename}`,
  });
  const url = `/uploads/${filename}`;
  return json({ ok: true, url });
}

export default function AdminImagesUpload() {
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";
  return (
    <main className="admin-shell">
      <p><Link to="/admin/images">← Images</Link></p>
      <h1>Upload image</h1>
      <Form method="post" encType="multipart/form-data">
        <div className="field">
          <label htmlFor="file">file (PNG/JPEG/WebP/GIF, max 5 MB)</label>
          <input id="file" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required />
        </div>
        <div className="save-row">
          <button type="submit" disabled={submitting}>{submitting ? "Uploading…" : "Upload"}</button>
        </div>
      </Form>
      {result?.ok && (
        <p className="success">Uploaded. URL: <code>{(result as any).url}</code></p>
      )}
      {result && !result.ok && <p className="error">{(result as any).error}</p>}
    </main>
  );
}
