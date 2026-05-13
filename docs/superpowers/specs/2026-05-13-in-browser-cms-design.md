# In-Browser CMS for tkoren.com

**Date:** 2026-05-13
**Status:** Design approved, pending spec review

## Goal

Edit all portfolio content (bio, interests, /now, books, images) directly from the deployed website without touching git locally. Single editor (the site owner). Content remains versioned in the existing repo.

## Non-goals

- Multi-user editing or roles
- Real-time collaborative editing
- Rich text WYSIWYG (plain text + markdown where needed is enough)
- A general-purpose CMS extractable to other sites

## Architecture overview

```
Browser (owner, logged in)
   │
   ▼
/admin/<page>     Remix route, server-rendered, gated by GitHub OAuth
   │  edit form, Save
   ▼
action()          Verifies session, validates payload with zod,
                  commits new JSON (or binary) via Octokit
   │
   ▼
GitHub main      Vercel webhook fires
   │
   ▼
Vercel rebuild   Site imports content/*.json as static modules.
                 Public pages re-render with new content.
```

Two completely separated paths:
- **Read path:** public pages import JSON at build time. No runtime fetch, no DB, no cache.
- **Write path:** admin form → server action → GitHub API → Vercel rebuild.

## Storage model

Git-backed. Every edit is a commit on `main` to `korentomas/tkoren.com`. Free version history, no database. ~30s rebuild latency from save to live is acceptable for a site edited occasionally by one person.

## Auth

GitHub OAuth, scoped to one username.

### Flow

1. Visit `/admin` while logged out → redirect to `/admin/login`.
2. `/admin/login` → "Sign in with GitHub" → `https://github.com/login/oauth/authorize?client_id=...&scope=&state=<csrf>`.
3. GitHub callback → `/admin/callback` validates state, exchanges code for access token, calls `GET /user`.
4. If `login !== ADMIN_GH_USERNAME`: 403, no session.
5. Otherwise sign HMAC session cookie `{ user, exp: now+30d }` and redirect to `/admin`.
6. Every `/admin/*` loader calls `requireAdmin(request)`, which verifies and refreshes the cookie or throws redirect to `/admin/login`.

### Env vars (Vercel)

| Name | Purpose |
|---|---|
| `GITHUB_CLIENT_ID` | OAuth app, identity only |
| `GITHUB_CLIENT_SECRET` | OAuth app secret |
| `ADMIN_GH_USERNAME` | `korentomas` |
| `SESSION_SECRET` | 32+ random chars for HMAC signing |
| `GITHUB_TOKEN` | Fine-grained PAT, `contents: write` on this repo only |

A separate PAT (not the OAuth token) handles commits. Keeps OAuth scope minimal and the commit credential is single-repo, single-permission.

## Content storage & migration

### New layout

```
content/
  site.json
  interests.json
  books.json
  now.json
  then.json

app/utils/
  schemas.ts        # zod schemas (single source of truth for types)
  site-config.ts    # isomorphic: imports JSON, parses with zod, exports SITE/BOOKS/INTERESTS/NOW/THEN/SITE_URL
```

### `site-config.ts` sketch

```ts
// app/utils/site-config.ts (isomorphic loader)
import { z } from "zod";
import siteData from "../../content/site.json";
import booksData from "../../content/books.json";
// ...
import { SiteSchema, BookSectionSchema, /* ... */ } from "./schemas";

export const SITE = SiteSchema.parse(siteData);
export const BOOKS = z.array(BookSectionSchema).parse(booksData);
// ...
export const SITE_URL = "https://tkoren.com";
```

Build-time validation. Malformed JSON fails the build loudly.

### Public page imports change

No path changes needed. Routes continue to import from `~/utils/site-config`,
which now loads and validates content at module init.

Note: zod parsing runs in both server and client bundles since `site-config.ts`
is isomorphic. Bundle cost is ~50 KB. A future optimization would split into
build-time validation + runtime-typed-plain-JSON for client.

### Migration

A one-shot script reads current TS constants, writes them to `content/*.json`. Lands as PR #1 of the implementation. After merge, `site-config.ts` retains only types/schemas.

### New dependency

`zod` (~50 KB, server-only). Doubles as save-action validator and build-time content validator.

## Admin UI

Single-purpose pages, one per content surface.

| Route | Edits |
|---|---|
| `/admin` | landing page, links + logout |
| `/admin/site` | name, title, bio, email, resumeUrl, social URLs, knowsAbout list |
| `/admin/interests` | reorderable `{title, body}[]` |
| `/admin/books` | sections + items, add/remove/reorder both |
| `/admin/now` | date + sections + optional links, with "snapshot current NOW → THEN" button |
| `/admin/then` | view/delete archived snapshots |
| `/admin/images` | upload, list, copy URL, delete |

Each editor is a Remix `<Form method="post">`. No client-state library. Controlled inputs plus `useFetcher` for "you have unsaved changes" hints. Save button triggers the action.

## Save pipeline

```ts
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAdmin(request); // throws 403 otherwise
  const formData = await request.formData();
  const parsed = SchemaForThisPage.safeParse(serialize(formData));
  if (!parsed.success) return json({ errors: parsed.error.format() }, 400);

  const path = pathForThisPage; // e.g. "content/books.json"
  const current = await octokit.repos.getContent({ owner, repo, path });
  const newContent = JSON.stringify(parsed.data, null, 2) + "\n";

  await octokit.repos.createOrUpdateFileContents({
    owner: "korentomas",
    repo: "tkoren.com",
    path,
    message: `cms: update ${path} via /admin`,
    content: Buffer.from(newContent).toString("base64"),
    sha: current.data.sha, // optimistic concurrency
    branch: "main",
  });

  return json({ ok: true, message: "Saved. Live in ~30s." });
}
```

One commit per save. Commits namespaced `cms:` for easy filtering in `git log`. SHA check prevents two-tabs-stale-overwrite.

## Image upload pipeline

`/admin/images/upload` action:

1. `multipart/form-data` from a plain `<input type="file">`.
2. Validate: size ≤ 5 MB, mime ∈ {`image/png`, `image/jpeg`, `image/webp`, `image/gif`}.
3. Filename = `<YYYY-MM-DD>-<slugified-original>.<ext>`, stored at `public/uploads/<filename>`.
4. Commit binary via the same `createOrUpdateFileContents` (handles binary natively with base64).
5. Response includes public URL `/uploads/<filename>` for copy-paste into content fields.

Image listing on `/admin/images` reads from `public/uploads/` directly at request time (during admin loader execution, not on public pages). Listing happens via Octokit `repos.getContent({ path: "public/uploads" })` so it works in the production runtime where the local filesystem is read-only.

Existing images at the root of `/public` (`me.png`, `also_me.png`, `croco.png`, `og-image.png`, `favicon.ico`, `theme-init.js`) stay where they are. The CMS only writes to `public/uploads/`. The image listing UI shows only uploads — pre-existing assets stay manually managed.

## Failure modes

| Failure | Handling |
|---|---|
| GitHub API rate limit | Action returns `{ error, retryAfter }` from `x-ratelimit-reset` header; UI shows countdown |
| Stale SHA (edited elsewhere) | Action returns `{ error: "Content changed in another session, reload to merge" }`, no commit made |
| Build fails after commit | Vercel sends deploy-failed email; bad JSON is in git, owner reverts manually. Mitigated by zod validation pre-commit |
| OAuth callback CSRF | State token in signed cookie, rejected on mismatch |
| Lost session mid-edit | Action redirects to `/admin/login`, edit form data lost (acceptable for single editor; could add localStorage draft persistence later if needed) |
| Image > 5 MB | Action rejects with size limit error before any upload attempt |

## Out of scope (deferred)

- Draft / preview / unpublished states (everything saves straight to main)
- Image cropping or in-browser resizing
- Bulk operations (delete-many, reorder-many) beyond what a single page offers
- Audit log beyond `git log` itself
- Backup strategy beyond "the repo is on GitHub"

## Implementation order

1. Migrate content to JSON, add zod schemas, swap imports, ship green build
2. Add session + OAuth + `requireAdmin` helper, with a no-op `/admin` placeholder
3. Build `/admin/site` and `/admin/now` (smallest forms first)
4. Build `/admin/interests`, `/admin/books`, `/admin/then`
5. Build `/admin/images` upload + list
6. Polish: unsaved-changes warning, save success toast, error UI consistency
