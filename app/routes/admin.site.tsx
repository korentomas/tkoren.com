import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { SiteSchema } from "~/utils/schemas";
import type { Site } from "~/utils/schemas";
import { SITE } from "~/utils/site-config";
import { commitJsonFile } from "~/utils/github.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ site: SITE });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const fd = await request.formData();
  const candidate = {
    name: fd.get("name"),
    alternateName: fd.get("alternateName"),
    title: fd.get("title"),
    bio: fd.get("bio"),
    email: fd.get("email"),
    image: fd.get("image"),
    resumeUrl: fd.get("resumeUrl"),
    description: fd.get("description"),
    shortDescription: fd.get("shortDescription"),
    knowsAbout: String(fd.get("knowsAbout") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    social: {
      github: fd.get("social.github"),
      linkedin: fd.get("social.linkedin"),
    },
  };
  const parsed = SiteSchema.safeParse(candidate);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.format() }, { status: 400 });
  await commitJsonFile({ path: "content/site.json", data: parsed.data, message: "cms: update site.json via /admin" });
  return json({ ok: true });
}

export default function AdminSite() {
  const { site } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";
  return (
    <main className="admin-shell">
      <p><Link to="/admin">← Admin</Link></p>
      <h1>Site metadata</h1>
      <Form method="post">
        {(["name","alternateName","title","bio","email","image","resumeUrl","shortDescription"] as const satisfies readonly (keyof Site)[]).map((k) => (
          <div className="field" key={k}>
            <label htmlFor={k}>{k}</label>
            <input id={k} name={k} defaultValue={site[k] as string} />
          </div>
        ))}
        <div className="field">
          <label htmlFor="description">description</label>
          <textarea id="description" name="description" defaultValue={site.description} />
        </div>
        <div className="field">
          <label htmlFor="knowsAbout">knowsAbout (one per line)</label>
          <textarea id="knowsAbout" name="knowsAbout" defaultValue={site.knowsAbout.join("\n")} />
        </div>
        <div className="field">
          <label htmlFor="social.github">social.github</label>
          <input id="social.github" name="social.github" defaultValue={site.social.github} />
        </div>
        <div className="field">
          <label htmlFor="social.linkedin">social.linkedin</label>
          <input id="social.linkedin" name="social.linkedin" defaultValue={site.social.linkedin} />
        </div>
        <div className="save-row">
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</button>
          {result?.ok && <span className="success">Saved. Live in ~30s.</span>}
          {result && !result.ok && <span className="error">Validation failed. Check fields.</span>}
        </div>
      </Form>
    </main>
  );
}
