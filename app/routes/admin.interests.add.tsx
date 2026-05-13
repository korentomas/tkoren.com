import type { ActionFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/server-runtime";
import { requireAdmin } from "~/utils/auth.server";
import { INTERESTS } from "~/utils/site-config";
import { commitJsonFile } from "~/utils/github.server";

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const next = [...INTERESTS, { title: "(new)", body: "(new)" }];
  await commitJsonFile({ path: "content/interests.json", data: next, message: "cms: add empty interest row" });
  return redirect("/admin/interests");
}
