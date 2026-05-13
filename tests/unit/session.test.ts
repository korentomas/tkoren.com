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
