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
