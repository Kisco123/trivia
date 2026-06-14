import { describe, it, expect, vi } from "vitest";
import { ensureSession, getCurrentUserId } from "@/lib/auth";

function client(session: unknown, user: unknown) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      signInAnonymously: vi.fn().mockResolvedValue({ data: { user: { id: "anon-1" } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  } as never;
}

describe("auth", () => {
  it("no crea sesión si ya existe", async () => {
    const c = client({ user: { id: "u1" } }, null);
    await ensureSession(c);
    expect(c.auth.signInAnonymously).not.toHaveBeenCalled();
  });
  it("crea sesión anónima si no hay", async () => {
    const c = client(null, null);
    await ensureSession(c);
    expect(c.auth.signInAnonymously).toHaveBeenCalledOnce();
  });
  it("getCurrentUserId devuelve el id del usuario", async () => {
    const c = client(null, { id: "u9" });
    expect(await getCurrentUserId(c)).toBe("u9");
  });
});
