import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "~/utils/session.server";

const SECRET = "test-secret-at-least-32-chars-long-x";

describe("session", () => {
  it("round-trips a payload", () => {
    const token = signSession({ user: "korentomas" }, SECRET, 60);
    const out = verifySession(token, SECRET);
    expect(out?.user).toBe("korentomas");
  });

  it("rejects a tampered body", () => {
    const token = signSession({ user: "korentomas" }, SECRET, 60);
    const [body, sig] = token.split(".");
    // Flip one byte in the encoded body; signature no longer matches.
    const flipped = (body[0] === "a" ? "b" : "a") + body.slice(1);
    expect(verifySession(`${flipped}.${sig}`, SECRET)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const token = signSession({ user: "korentomas" }, SECRET, 60);
    const [body, sig] = token.split(".");
    const flipped = (sig[0] === "a" ? "b" : "a") + sig.slice(1);
    expect(verifySession(`${body}.${flipped}`, SECRET)).toBeNull();
  });

  it("rejects with wrong secret", () => {
    const token = signSession({ user: "korentomas" }, SECRET, 60);
    expect(verifySession(token, "different-secret-also-32-chars-x")).toBeNull();
  });

  it("rejects an expired payload", () => {
    const token = signSession({ user: "korentomas" }, SECRET, -1);
    expect(verifySession(token, SECRET)).toBeNull();
  });
});
