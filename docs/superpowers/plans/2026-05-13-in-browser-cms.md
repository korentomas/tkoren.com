# In-Browser CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin panel at `/admin` for editing all portfolio content (bio, interests, /now, books, images) directly from the deployed website, with edits committed to GitHub and deployed via Vercel rebuild.

**Architecture:** Public pages import content from `content/*.json` as static modules. Admin pages (GitHub-OAuth-gated, single user) write back to those JSON files via the GitHub API. Image uploads commit binaries to `public/uploads/`. No DB, no runtime fetches.

**Tech Stack:** Remix 2.10 (Vite), TypeScript, React 18, zod (new), @octokit/rest (new), vitest (new, dev-only). Deployed on Vercel.

**Spec:** [`docs/superpowers/specs/2026-05-13-in-browser-cms-design.md`](../specs/2026-05-13-in-browser-cms-design.md)

---

## Parallelization Map

```
Phase 1 (sequential)  →  Phase 2 (sequential)  →  Phase 3 (sequential)
                                                       │
                                ┌──────────────────────┼──────────────────────┐
                                ▼                      ▼                      ▼
                          Phase 4 (parallel)    Phase 5 (parallel)    (none)
                          Tasks 14–18           Task 19, Task 20
                                │                      │
                                └──────────┬───────────┘
                                           ▼
                                    Phase 6 (sequential)
```

Phases 4 and 5 can run in parallel once Phase 3 is complete. Within Phase 4, the five editor tasks (14–18) can run in parallel since each touches an independent route file.

---

## File Structure

**New files:**
```
content/
  site.json                          # SITE object
  interests.json                     # INTERESTS array
  books.json                         # BOOKS array
  now.json                           # NOW snapshot
  then.json                          # THEN array

app/utils/
  content.server.ts                  # loads + validates content/*.json
  schemas.ts                         # zod schemas (single source of truth)
  session.server.ts                  # HMAC cookie sign/verify
  auth.server.ts                     # requireAdmin + GitHub OAuth helpers
  github.server.ts                   # Octokit wrapper for read/write JSON & binary

app/routes/
  admin._index.tsx                   # landing
  admin.login.tsx                    # sign-in page
  admin.callback.tsx                 # OAuth callback
  admin.logout.tsx                   # logout action
  admin.site.tsx                     # site metadata editor
  admin.interests.tsx                # interests editor
  admin.books.tsx                    # books editor
  admin.now.tsx                      # now snapshot editor
  admin.then.tsx                     # then archive editor
  admin.images._index.tsx            # image list
  admin.images.upload.tsx            # upload action

app/styles/
  admin.css                          # admin-only styling

tests/unit/
  schemas.test.ts
  session.test.ts
  auth.test.ts

vitest.config.ts                     # vitest config
```

**Modified files:**
```
app/utils/site-config.ts             # reduced to re-exports of types from schemas.ts
app/routes/_index.tsx                # import { SITE } from "~/utils/content.server"
app/routes/books.tsx                 # same
app/routes/interests.tsx             # same
app/routes/now.tsx                   # same
app/routes/then.tsx                  # same
app/components/Layout.tsx            # same (if it imports SITE)
package.json                         # add zod, @octokit/rest, vitest
```

---

## Phase 1 — Content migration to JSON

### Task 1: Install zod and vitest

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install zod and vitest as dev/runtime deps**

```bash
npm install zod
npm install -D vitest @vitest/ui
```

- [ ] **Step 2: Add test:unit script**

Edit `package.json` `scripts`:
```json
{
  "scripts": {
    "build": "remix vite:build",
    "dev": "remix vite:dev",
    "test": "playwright test",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "typecheck": "tsc"
  }
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add zod and vitest"
```

---

### Task 2: Define zod schemas in `app/utils/schemas.ts`

**Files:**
- Create: `app/utils/schemas.ts`
- Test: `tests/unit/schemas.test.ts`

- [ ] **Step 1: Write failing schema tests**

`tests/unit/schemas.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  SiteSchema,
  BookSchema,
  BookSectionSchema,
  InterestSchema,
  NowSnapshotSchema,
} from "~/utils/schemas";

describe("SiteSchema", () => {
  it("accepts a valid site object", () => {
    const result = SiteSchema.safeParse({
      name: "Tomás Korenblit",
      alternateName: "Tomas Korenblit",
      title: "Bayesian Data Scientist",
      bio: "Bayesian Data Scientist @ Buenos Aires.",
      email: "tomaskorenblit@gmail.com",
      image: "/optimized-images/also_me-800w-90q.webp",
      resumeUrl: "/resume/16-04-2026.pdf",
      description: "desc",
      shortDescription: "short desc",
      knowsAbout: ["AI Safety"],
      social: { github: "https://github.com/korentomas", linkedin: "https://linkedin.com/in/x" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects when email is missing", () => {
    const result = SiteSchema.safeParse({ name: "x" });
    expect(result.success).toBe(false);
  });
});

describe("BookSchema", () => {
  it("requires title and author, makes note/rating optional", () => {
    expect(BookSchema.safeParse({ title: "x", author: "y" }).success).toBe(true);
    expect(BookSchema.safeParse({ title: "x" }).success).toBe(false);
  });
});

describe("InterestSchema", () => {
  it("requires title and body", () => {
    expect(InterestSchema.safeParse({ title: "x", body: "y" }).success).toBe(true);
    expect(InterestSchema.safeParse({ title: "x" }).success).toBe(false);
  });
});

describe("NowSnapshotSchema", () => {
  it("accepts a snapshot with date and sections", () => {
    const result = NowSnapshotSchema.safeParse({
      date: "2026-05-13",
      sections: [{ heading: "Work", body: "thing" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a section with an optional link", () => {
    const result = NowSnapshotSchema.safeParse({
      date: "2026-05-13",
      sections: [
        { heading: "Writing", body: "x", link: { href: "/a.pdf", label: "PDF" } },
      ],
    });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm run test:unit`
Expected: failures because `app/utils/schemas.ts` does not exist yet.

- [ ] **Step 3: Implement `app/utils/schemas.ts`**

```ts
import { z } from "zod";

export const SiteSchema = z.object({
  name: z.string().min(1),
  alternateName: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  email: z.string().email(),
  image: z.string().min(1),
  resumeUrl: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  knowsAbout: z.array(z.string()).min(1),
  social: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
  }),
});
export type Site = z.infer<typeof SiteSchema>;

export const BookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  note: z.string().optional(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
});
export type Book = z.infer<typeof BookSchema>;

export const BookSectionSchema = z.object({
  section: z.string().min(1),
  items: z.array(BookSchema),
});
export type BookSection = z.infer<typeof BookSectionSchema>;

export const InterestSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});
export type Interest = z.infer<typeof InterestSchema>;

export const NowSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  link: z.object({ href: z.string().min(1), label: z.string().min(1) }).optional(),
});
export type NowSection = z.infer<typeof NowSectionSchema>;

export const NowSnapshotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  sections: z.array(NowSectionSchema),
});
export type NowSnapshot = z.infer<typeof NowSnapshotSchema>;
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm run test:unit`
Expected: all schema tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/utils/schemas.ts tests/unit/schemas.test.ts
git commit -m "feat: add zod schemas for content"
```

---

### Task 3: Create `content/*.json` from current TS values

**Files:**
- Create: `content/site.json`, `content/interests.json`, `content/books.json`, `content/now.json`, `content/then.json`

- [ ] **Step 1: Write the JSON files**

Copy the current values from `app/utils/site-config.ts` verbatim.

`content/site.json`:
```json
{
  "name": "Tomás Korenblit",
  "alternateName": "Tomas Korenblit",
  "title": "Bayesian Data Scientist",
  "bio": "Bayesian Data Scientist @ Buenos Aires.",
  "email": "tomaskorenblit@gmail.com",
  "image": "/optimized-images/also_me-800w-90q.webp",
  "resumeUrl": "/resume/16-04-2026.pdf",
  "description": "Tomás Korenblit, Bayesian Data Scientist. Notes on books, ideas, and what I'm working on.",
  "shortDescription": "Bayesian Data Scientist.",
  "knowsAbout": ["Causal Inference", "Bayesian Statistics", "Data Science", "AI Safety", "Software Engineering"],
  "social": {
    "github": "https://github.com/korentomas",
    "linkedin": "https://linkedin.com/in/tomaskorenblit"
  }
}
```

`content/interests.json`:
```json
[
  { "title": "Causal inference", "body": "Priors are awesome, online learning? Incredible. I live a Bayesian life, thinking of all events as they adapt my knowledge." },
  { "title": "AI safety", "body": "Alignment and interpretability are fascinating and I'm learning more and more every day. Yet I can't help but think that LLMs alone won't safely get us there; we need to understand what these systems are doing inside before we can trust what's coming out." },
  { "title": "Recreational thinking", "body": "Send me an email if you want to chat! I mean it." }
]
```

`content/books.json`:
```json
[
  {
    "section": "Causal & Bayesian",
    "items": [
      { "title": "The Book of Why", "author": "Judea Pearl & Dana Mackenzie" },
      { "title": "Bayesian Analysis with Python", "author": "Osvaldo Martin" }
    ]
  },
  {
    "section": "Non-fiction",
    "items": [
      { "title": "El nudo de la conciencia", "author": "Enzo Tagliazucchi" }
    ]
  },
  {
    "section": "Fiction",
    "items": [
      { "title": "The Pearl", "author": "John Steinbeck" },
      { "title": "Cat's Cradle", "author": "Kurt Vonnegut" }
    ]
  }
]
```

`content/now.json`:
```json
{
  "date": "2026-05-06",
  "sections": [
    { "heading": "Work", "body": "Doing the BlueDot Technical AI Safety course, facilitated by BAISH (Buenos Aires AI Safety Hub)." },
    { "heading": "Reading", "body": "El infinito en un junco by Irene Vallejo." },
    { "heading": "Writing", "body": "Drafting a paper on which instructions LLMs actually retain across long coding sessions (Not All Instructions Are Forgotten Equal). Bayesian ordered logistic over 244 compliance observations; treatment effects span an order of magnitude across instruction types.", "link": { "href": "/papers/not_all_instructions.pdf", "label": "Read the draft (PDF)" } },
    { "heading": "Thinking about", "body": "AI safety, particularly how you tell whether a system has internalized a rule versus pattern-matched around it." }
  ]
}
```

`content/then.json`:
```json
[]
```

- [ ] **Step 2: Validate by running unit tests (extends them)**

Append to `tests/unit/schemas.test.ts`:
```ts
import siteData from "../../content/site.json";
import booksData from "../../content/books.json";
import interestsData from "../../content/interests.json";
import nowData from "../../content/now.json";
import thenData from "../../content/then.json";
import { z } from "zod";

describe("content files parse", () => {
  it("site.json", () => { expect(SiteSchema.safeParse(siteData).success).toBe(true); });
  it("books.json", () => { expect(z.array(BookSectionSchema).safeParse(booksData).success).toBe(true); });
  it("interests.json", () => { expect(z.array(InterestSchema).safeParse(interestsData).success).toBe(true); });
  it("now.json", () => { expect(NowSnapshotSchema.safeParse(nowData).success).toBe(true); });
  it("then.json", () => { expect(z.array(NowSnapshotSchema).safeParse(thenData).success).toBe(true); });
});
```

Run: `npm run test:unit`
Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add content/ tests/unit/schemas.test.ts
git commit -m "feat: migrate content to JSON files"
```

---

### Task 4: Create `content.server.ts` and shrink `site-config.ts`

**Files:**
- Create: `app/utils/content.server.ts`
- Modify: `app/utils/site-config.ts`

- [ ] **Step 1: Create `app/utils/content.server.ts`**

```ts
import { z } from "zod";
import siteData from "../../content/site.json";
import interestsData from "../../content/interests.json";
import booksData from "../../content/books.json";
import nowData from "../../content/now.json";
import thenData from "../../content/then.json";
import {
  SiteSchema,
  InterestSchema,
  BookSectionSchema,
  NowSnapshotSchema,
} from "./schemas";

export const SITE = SiteSchema.parse(siteData);
export const INTERESTS = z.array(InterestSchema).parse(interestsData);
export const BOOKS = z.array(BookSectionSchema).parse(booksData);
export const NOW = NowSnapshotSchema.parse(nowData);
export const THEN = z.array(NowSnapshotSchema).parse(thenData);

export const SITE_URL = "https://tkoren.com";
```

- [ ] **Step 2: Replace `app/utils/site-config.ts` with a thin re-export**

Entire new contents:
```ts
export { SITE_URL } from "./content.server";
export type { Site, Book, BookSection, Interest, NowSection, NowSnapshot } from "./schemas";
```

(All `SITE`, `BOOKS`, etc. value exports are removed — routes will import them from `content.server` directly.)

- [ ] **Step 3: Add `resolveJsonModule` to `tsconfig.json` if not already enabled**

Check `tsconfig.json`. If `compilerOptions.resolveJsonModule` is not `true`, add it. Run `cat tsconfig.json` first to inspect.

- [ ] **Step 4: Commit**

```bash
git add app/utils/content.server.ts app/utils/site-config.ts tsconfig.json
git commit -m "feat: load content from JSON via content.server.ts"
```

---

### Task 5: Update public routes to import from `content.server`

**Files:**
- Modify: `app/routes/_index.tsx`, `app/routes/books.tsx`, `app/routes/interests.tsx`, `app/routes/now.tsx`, `app/routes/then.tsx`, `app/routes/robots[.]txt.ts`, `app/routes/sitemap[.]xml.ts`, `app/components/Layout.tsx`

- [ ] **Step 1: Find every importer of `site-config` value exports**

Run: `grep -rn "from \"~/utils/site-config\"" app/`

For each file that imports a *value* (SITE, INTERESTS, BOOKS, NOW, THEN, SITE_URL): change the import to `~/utils/content.server`.

Type-only imports (`type Book`, `type Interest`) stay pointing at `~/utils/site-config`.

Example change in `app/routes/now.tsx`:
```diff
- import { NOW, SITE, SITE_URL } from "~/utils/site-config";
+ import { NOW, SITE, SITE_URL } from "~/utils/content.server";
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Smoke-test dev server**

Run: `npm run dev` (background)
Open http://localhost:3000/ , /books , /interests , /now , /then
Confirm content renders as before.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "refactor: route imports point at content.server"
```

---

## Phase 2 — Auth foundation

### Task 6: Session cookie HMAC helpers

**Files:**
- Create: `app/utils/session.server.ts`
- Test: `tests/unit/session.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/unit/session.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "~/utils/session.server";

const SECRET = "test-secret-at-least-32-chars-long-x";

describe("session", () => {
  it("round-trips a payload", () => {
    const token = signSession({ user: "korentomas" }, SECRET, 60);
    const out = verifySession(token, SECRET);
    expect(out?.user).toBe("korentomas");
  });

  it("rejects a tampered payload", () => {
    const token = signSession({ user: "korentomas" }, SECRET, 60);
    const tampered = token.replace("korentomas", "attacker");
    expect(verifySession(tampered, SECRET)).toBeNull();
  });

  it("rejects an expired payload", () => {
    const token = signSession({ user: "korentomas" }, SECRET, -1);
    expect(verifySession(token, SECRET)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm run test:unit -- session`
Expected: module not found.

- [ ] **Step 3: Implement `app/utils/session.server.ts`**

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

type Payload = { user: string };
type SignedPayload = Payload & { exp: number };

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function hmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function signSession(payload: Payload, secret: string, ttlSeconds: number): string {
  const signed: SignedPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = b64url(JSON.stringify(signed));
  const sig = hmac(body, secret);
  return `${body}.${sig}`;
}

export function verifySession(token: string, secret: string): Payload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = hmac(body, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedPayload;
    if (typeof parsed.exp !== "number" || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return { user: parsed.user };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "tk_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm run test:unit -- session`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/utils/session.server.ts tests/unit/session.test.ts
git commit -m "feat: signed session cookie helpers"
```

---

### Task 7: `requireAdmin` and OAuth helpers

**Files:**
- Create: `app/utils/auth.server.ts`
- Test: `tests/unit/auth.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/unit/auth.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { requireAdmin } from "~/utils/auth.server";
import { signSession, SESSION_COOKIE } from "~/utils/session.server";

const SECRET = "test-secret-at-least-32-chars-long-x";

function reqWithCookie(cookie: string): Request {
  return new Request("http://localhost/admin", { headers: { cookie } });
}

describe("requireAdmin", () => {
  it("throws redirect when no cookie", async () => {
    process.env.SESSION_SECRET = SECRET;
    process.env.ADMIN_GH_USERNAME = "korentomas";
    const req = new Request("http://localhost/admin");
    try {
      await requireAdmin(req);
      throw new Error("did not redirect");
    } catch (res) {
      expect(res).toBeInstanceOf(Response);
      expect((res as Response).status).toBe(302);
      expect((res as Response).headers.get("Location")).toBe("/admin/login");
    }
  });

  it("returns user when cookie valid and user matches", async () => {
    process.env.SESSION_SECRET = SECRET;
    process.env.ADMIN_GH_USERNAME = "korentomas";
    const token = signSession({ user: "korentomas" }, SECRET, 600);
    const req = reqWithCookie(`${SESSION_COOKIE}=${token}`);
    const user = await requireAdmin(req);
    expect(user).toBe("korentomas");
  });

  it("throws redirect when cookie user does not match allowed", async () => {
    process.env.SESSION_SECRET = SECRET;
    process.env.ADMIN_GH_USERNAME = "korentomas";
    const token = signSession({ user: "someone-else" }, SECRET, 600);
    const req = reqWithCookie(`${SESSION_COOKIE}=${token}`);
    try {
      await requireAdmin(req);
      throw new Error("did not redirect");
    } catch (res) {
      expect((res as Response).status).toBe(302);
    }
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm run test:unit -- auth`
Expected: module not found.

- [ ] **Step 3: Implement `app/utils/auth.server.ts`**

```ts
import { redirect } from "@remix-run/server-runtime";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session.server";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    const [k, ...rest] = part.split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function requireAdmin(request: Request): Promise<string> {
  const secret = getEnv("SESSION_SECRET");
  const allowed = getEnv("ADMIN_GH_USERNAME");
  const cookie = parseCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!cookie) throw redirect("/admin/login");
  const payload = verifySession(cookie, secret);
  if (!payload || payload.user !== allowed) throw redirect("/admin/login");
  return payload.user;
}

export function makeSessionCookie(user: string): string {
  const secret = getEnv("SESSION_SECRET");
  const token = signSession({ user }, secret, SESSION_TTL_SECONDS);
  const attrs = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  return attrs.join("; ");
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

// --- OAuth helpers ---

export function githubAuthorizeUrl(state: string): string {
  const clientId = getEnv("GITHUB_CLIENT_ID");
  const params = new URLSearchParams({ client_id: clientId, scope: "", state });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForUser(code: string): Promise<string> {
  const clientId = getEnv("GITHUB_CLIENT_ID");
  const clientSecret = getEnv("GITHUB_CLIENT_SECRET");

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  if (!tokenRes.ok) throw new Error(`OAuth token exchange failed: ${tokenRes.status}`);
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const token = tokenJson.access_token;
  if (!token) throw new Error("OAuth token exchange returned no access_token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
  });
  if (!userRes.ok) throw new Error(`GitHub /user failed: ${userRes.status}`);
  const userJson = (await userRes.json()) as { login?: string };
  if (!userJson.login) throw new Error("GitHub /user returned no login");
  return userJson.login;
}

// --- CSRF state cookie helpers ---

const STATE_COOKIE = "tk_admin_oauth_state";

export function makeStateCookie(state: string): string {
  return `${STATE_COOKIE}=${state}; Path=/admin; HttpOnly; SameSite=Lax; Secure; Max-Age=600`;
}

export function readStateCookie(request: Request): string | null {
  return parseCookie(request.headers.get("cookie"), STATE_COOKIE);
}

export function clearStateCookie(): string {
  return `${STATE_COOKIE}=; Path=/admin; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm run test:unit -- auth`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/utils/auth.server.ts tests/unit/auth.test.ts
git commit -m "feat: requireAdmin + GitHub OAuth helpers"
```

---

### Task 8: Admin landing, login, callback, logout routes

**Files:**
- Create: `app/routes/admin._index.tsx`, `app/routes/admin.login.tsx`, `app/routes/admin.callback.tsx`, `app/routes/admin.logout.tsx`
- Create: `app/styles/admin.css`

- [ ] **Step 1: Create `app/styles/admin.css`**

```css
.admin-shell { max-width: 60ch; margin: 4rem auto; padding: 0 1.5rem; font-family: var(--font-body, system-ui); }
.admin-shell h1 { margin-bottom: 1rem; }
.admin-shell nav ul { list-style: none; padding: 0; }
.admin-shell nav li { margin: 0.5rem 0; }
.admin-shell .save-row { display: flex; gap: 1rem; align-items: center; margin-top: 1.5rem; }
.admin-shell button { padding: 0.5rem 1rem; cursor: pointer; }
.admin-shell .field { display: flex; flex-direction: column; margin-bottom: 1rem; }
.admin-shell label { font-weight: 600; margin-bottom: 0.25rem; }
.admin-shell input, .admin-shell textarea { padding: 0.5rem; font: inherit; }
.admin-shell textarea { min-height: 6rem; resize: vertical; }
.admin-shell .error { color: #b00020; }
.admin-shell .success { color: #0a7d2c; }
.admin-shell .muted { color: #666; font-size: 0.9rem; }
```

- [ ] **Step 2: Create `app/routes/admin._index.tsx`**

```tsx
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json, Form, Link, useLoaderData } from "@remix-run/react";
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
```

- [ ] **Step 3: Create `app/routes/admin.login.tsx`**

```tsx
import type { LoaderFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { randomBytes } from "node:crypto";
import { githubAuthorizeUrl, makeStateCookie } from "~/utils/auth.server";
import adminCss from "~/styles/admin.css?url";

export const links = () => [{ rel: "stylesheet", href: adminCss }];

export async function loader({ request }: LoaderFunctionArgs) {
  const state = randomBytes(16).toString("hex");
  const url = githubAuthorizeUrl(state);
  return new Response(JSON.stringify({ url }), {
    headers: { "content-type": "application/json", "set-cookie": makeStateCookie(state) },
  });
}

export default function AdminLogin() {
  const { url } = useLoaderData<typeof loader>();
  return (
    <main className="admin-shell">
      <h1>Admin sign-in</h1>
      <p>Authorize with GitHub to edit content.</p>
      <p><a href={url}><button type="button">Sign in with GitHub</button></a></p>
    </main>
  );
}
```

- [ ] **Step 4: Create `app/routes/admin.callback.tsx`**

```tsx
import type { LoaderFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/server-runtime";
import {
  exchangeCodeForUser,
  makeSessionCookie,
  readStateCookie,
  clearStateCookie,
} from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = readStateCookie(request);

  if (!code || !state || !expected || state !== expected) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  const allowed = process.env.ADMIN_GH_USERNAME;
  const login = await exchangeCodeForUser(code);
  if (login !== allowed) {
    return new Response("Not authorized", { status: 403 });
  }

  const headers = new Headers();
  headers.append("set-cookie", makeSessionCookie(login));
  headers.append("set-cookie", clearStateCookie());
  headers.set("location", "/admin");
  return new Response(null, { status: 302, headers });
}
```

- [ ] **Step 5: Create `app/routes/admin.logout.tsx`**

```tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/server-runtime";
import { clearSessionCookie } from "~/utils/auth.server";

export async function action(_: ActionFunctionArgs) {
  return new Response(null, {
    status: 302,
    headers: { location: "/admin/login", "set-cookie": clearSessionCookie() },
  });
}

export async function loader(_: LoaderFunctionArgs) {
  return redirect("/admin/login");
}
```

- [ ] **Step 6: Verify build and typecheck**

Run: `npm run typecheck && npm run build`
Expected: success.

- [ ] **Step 7: Commit**

```bash
git add app/routes/admin*.tsx app/styles/admin.css
git commit -m "feat: admin auth routes (landing, login, callback, logout)"
```

---

## Phase 3 — GitHub commit helper

### Task 9: `github.server.ts` wrapper around Octokit

**Files:**
- Create: `app/utils/github.server.ts`
- Modify: `package.json`

- [ ] **Step 1: Install `@octokit/rest`**

Run: `npm install @octokit/rest`

- [ ] **Step 2: Create `app/utils/github.server.ts`**

```ts
import { Octokit } from "@octokit/rest";

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const OWNER = "korentomas";
const REPO = "tkoren.com";
const BRANCH = "main";

function client(): Octokit {
  return new Octokit({ auth: envOrThrow("GITHUB_TOKEN") });
}

export type FileSha = { sha: string };

export async function getFileSha(path: string): Promise<string | null> {
  const octo = client();
  try {
    const res = await octo.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
    if (Array.isArray(res.data)) return null;
    if (!("sha" in res.data)) return null;
    return res.data.sha;
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function commitJsonFile(args: {
  path: string;
  data: unknown;
  message: string;
}): Promise<{ commitUrl: string }> {
  const octo = client();
  const sha = await getFileSha(args.path);
  const content = Buffer.from(JSON.stringify(args.data, null, 2) + "\n", "utf8").toString("base64");
  const res = await octo.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: args.path,
    message: args.message,
    content,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  });
  const commitUrl = res.data.commit.html_url ?? "";
  return { commitUrl };
}

export async function commitBinaryFile(args: {
  path: string;
  contentBase64: string;
  message: string;
}): Promise<{ commitUrl: string }> {
  const octo = client();
  const sha = await getFileSha(args.path);
  const res = await octo.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: args.path,
    message: args.message,
    content: args.contentBase64,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  });
  return { commitUrl: res.data.commit.html_url ?? "" };
}

export async function listDirectory(path: string): Promise<{ name: string; downloadUrl: string | null }[]> {
  const octo = client();
  try {
    const res = await octo.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
    if (!Array.isArray(res.data)) return [];
    return res.data.map((entry) => ({ name: entry.name, downloadUrl: entry.download_url }));
  } catch (err: any) {
    if (err?.status === 404) return [];
    throw err;
  }
}

export async function deleteFile(args: { path: string; message: string }): Promise<void> {
  const octo = client();
  const sha = await getFileSha(args.path);
  if (!sha) return;
  await octo.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path: args.path,
    message: args.message,
    sha,
    branch: BRANCH,
  });
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json app/utils/github.server.ts
git commit -m "feat: github.server.ts (Octokit wrapper)"
```

---

## Phase 4 — Editor routes (parallel-safe)

Each of Tasks 10–14 is an independent route file. They can be executed by separate agents in parallel since they share no file beyond the already-stable `content.server.ts`, `auth.server.ts`, `github.server.ts`, and `schemas.ts`.

### Task 10: `/admin/site` editor

**Files:**
- Create: `app/routes/admin.site.tsx`

- [ ] **Step 1: Implement the route**

```tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json, Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { SiteSchema } from "~/utils/schemas";
import { SITE } from "~/utils/content.server";
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
        {(["name","alternateName","title","bio","email","image","resumeUrl","shortDescription"] as const).map((k) => (
          <div className="field" key={k}>
            <label htmlFor={k}>{k}</label>
            <input id={k} name={k} defaultValue={(site as any)[k]} />
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/routes/admin.site.tsx
git commit -m "feat: /admin/site editor"
```

---

### Task 11: `/admin/interests` editor

**Files:**
- Create: `app/routes/admin.interests.tsx`

- [ ] **Step 1: Implement the route**

```tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json, Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { z } from "zod";
import { requireAdmin } from "~/utils/auth.server";
import { InterestSchema } from "~/utils/schemas";
import { INTERESTS } from "~/utils/content.server";
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
        {/* hidden empty row appended via JS would add UI; for v1 add a single blank row via a separate submit */}
        <div className="save-row">
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</button>
          {result?.ok && <span className="success">Saved. Live in ~30s.</span>}
          {result && !result.ok && <span className="error">Validation failed.</span>}
        </div>
      </Form>
      <p className="muted">
        To add a new interest, fill in an empty row at the bottom on next visit, or paste a blank pair (leave the others). Reorder by editing the saved JSON locally if needed.
      </p>
      <Form method="post" action="/admin/interests/add">
        <button type="submit" name="_add" value="1">Add empty row</button>
      </Form>
    </main>
  );
}
```

Note: A separate "add empty row" action keeps this minimal. The route receives a POST that re-saves the existing rows plus one empty row. Add this resource route:

- [ ] **Step 2: Create `app/routes/admin.interests.add.tsx`**

```tsx
import type { ActionFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/server-runtime";
import { requireAdmin } from "~/utils/auth.server";
import { INTERESTS } from "~/utils/content.server";
import { commitJsonFile } from "~/utils/github.server";

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const next = [...INTERESTS, { title: "(new)", body: "(new)" }];
  await commitJsonFile({ path: "content/interests.json", data: next, message: "cms: add empty interest row" });
  return redirect("/admin/interests");
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/routes/admin.interests.tsx app/routes/admin.interests.add.tsx
git commit -m "feat: /admin/interests editor"
```

---

### Task 12: `/admin/books` editor

**Files:**
- Create: `app/routes/admin.books.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json, Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { z } from "zod";
import { requireAdmin } from "~/utils/auth.server";
import { BookSectionSchema } from "~/utils/schemas";
import { BOOKS } from "~/utils/content.server";
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
  // Encoding: each section gets a hidden "sectionIndex" and rows are flat with sectionIndex per row.
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
      <p className="muted">Edit the JSON directly. Validation runs before save. (A richer per-row UI can come later — v1 keeps this honest.)</p>
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/routes/admin.books.tsx
git commit -m "feat: /admin/books editor (JSON form)"
```

---

### Task 13: `/admin/now` editor with "snapshot to /then" action

**Files:**
- Create: `app/routes/admin.now.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json, Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { NowSnapshotSchema } from "~/utils/schemas";
import { z } from "zod";
import { NOW, THEN } from "~/utils/content.server";
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/routes/admin.now.tsx
git commit -m "feat: /admin/now editor with snapshot-to-then"
```

---

### Task 14: `/admin/then` archive editor

**Files:**
- Create: `app/routes/admin.then.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json, Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { z } from "zod";
import { requireAdmin } from "~/utils/auth.server";
import { NowSnapshotSchema } from "~/utils/schemas";
import { THEN } from "~/utils/content.server";
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/routes/admin.then.tsx
git commit -m "feat: /admin/then editor"
```

---

## Phase 5 — Image upload (parallel with Phase 4)

### Task 15: `/admin/images` list + upload

**Files:**
- Create: `app/routes/admin.images._index.tsx`
- Create: `app/routes/admin.images.upload.tsx`

- [ ] **Step 1: Create the list page**

`app/routes/admin.images._index.tsx`:
```tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { json, Form, Link, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
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
      <p><Link to="/admin/images/upload"><button type="button">Upload new image</button></Link></p>
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
      {result && !result.ok && <p className="error">{result.error}</p>}
    </main>
  );
}
```

- [ ] **Step 2: Create the upload route**

`app/routes/admin.images.upload.tsx`:
```tsx
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
const MAX_BYTES = 5 * 1024 * 1024;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
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
  const safeName = slugify(file.name) || "upload";
  const filename = `${today}-${safeName}`;
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
        <p className="success">Uploaded. URL: <code>{result.url}</code></p>
      )}
      {result && !result.ok && <p className="error">{result.error}</p>}
    </main>
  );
}
```

- [ ] **Step 3: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/routes/admin.images._index.tsx app/routes/admin.images.upload.tsx
git commit -m "feat: /admin/images list + upload"
```

---

## Phase 6 — Verification & docs

### Task 16: End-to-end smoke test (local) and env var docs

**Files:**
- Create: `docs/admin-setup.md`

- [ ] **Step 1: Write env var setup doc**

`docs/admin-setup.md`:
```markdown
# Admin setup

The /admin panel requires GitHub OAuth + a PAT for commits.

## One-time setup

1. **Create a GitHub OAuth app** at https://github.com/settings/developers
   - Application name: `tkoren.com admin`
   - Homepage URL: `https://tkoren.com`
   - Authorization callback URL: `https://tkoren.com/admin/callback`
   - Save and copy Client ID + Client Secret.

2. **Create a fine-grained PAT** at https://github.com/settings/tokens?type=beta
   - Repository access: only `korentomas/tkoren.com`
   - Permissions: `Contents: Read and write`
   - Copy the token (one-time view).

3. **Set Vercel env vars** (Production + Preview + Development):
   - `GITHUB_CLIENT_ID` → OAuth Client ID
   - `GITHUB_CLIENT_SECRET` → OAuth Client Secret
   - `ADMIN_GH_USERNAME` → `korentomas`
   - `SESSION_SECRET` → output of `openssl rand -hex 32`
   - `GITHUB_TOKEN` → the fine-grained PAT

4. **Redeploy** so the function picks up the new env.

## Local dev

For testing locally, set the same vars in `.env` (which is git-ignored). The OAuth callback URL must match — for local you can either:
- Set up a second OAuth app with callback `http://localhost:3000/admin/callback`, or
- Skip OAuth locally and hard-code a session cookie for testing.
```

- [ ] **Step 2: Local smoke test (manual)**

Run: `npm run typecheck && npm run test:unit && npm run build`
Expected: all three pass.

Run: `npm run dev`
Visit:
- `/` — content renders as before (sanity check Phase 1 didn't regress)
- `/admin` — redirects to `/admin/login`
- (Skip OAuth flow locally unless env is configured)

- [ ] **Step 3: Commit**

```bash
git add docs/admin-setup.md
git commit -m "docs: admin setup guide"
```

- [ ] **Step 4: Open PR**

```bash
git push -u origin <branch>
gh pr create --title "In-browser CMS at /admin" --body "$(cat <<'EOF'
## Summary

Implements the in-browser CMS designed in docs/superpowers/specs/2026-05-13-in-browser-cms-design.md.

- Content migrated from TS constants to content/*.json
- GitHub OAuth gating for /admin (single user)
- Editors: site, interests, books, now, then, images
- Image upload commits to public/uploads/
- All saves commit to main via Octokit, Vercel rebuilds in ~30s

## Test plan

- [ ] Configure env vars per docs/admin-setup.md
- [ ] Visit /admin (logged out) → redirects to /admin/login
- [ ] Sign in with non-allowed GitHub user → 403
- [ ] Sign in as korentomas → lands on /admin
- [ ] Edit /admin/site → verify commit on main and live after rebuild
- [ ] Edit /admin/now → same
- [ ] Upload an image → URL is committed and accessible
- [ ] Delete an image → file removed from repo
- [ ] /admin/now → "Archive current /now → /then" → THEN gets the snapshot
EOF
)"
```

---

## Self-review

**Spec coverage check:** Every section of the spec maps to one or more tasks:
- Goal / non-goals → reflected in scope of admin routes
- Architecture overview → Phase 1 + Phase 3 + Phases 4–5
- Storage model (git-backed) → Task 9 (Octokit), Tasks 10–15 (save actions)
- Auth → Tasks 6, 7, 8
- Content storage & migration → Tasks 2, 3, 4, 5
- Admin UI table → Tasks 10–15
- Save pipeline → Task 9 + each editor
- Image upload pipeline → Task 15
- Failure modes → handled inline in actions (validation, SHA conflict via Octokit error, size/MIME checks, OAuth state check)
- Out-of-scope items → not implemented (correct)
- Implementation order → matches the phase order here

**Placeholder scan:** No "TBD" / "TODO" / "fill in" in the plan. All code blocks are concrete.

**Type consistency:** All routes import schemas from `~/utils/schemas`, content from `~/utils/content.server`, commit helper from `~/utils/github.server`. The `commitJsonFile` / `commitBinaryFile` / `deleteFile` / `listDirectory` names are stable across all consumers.
