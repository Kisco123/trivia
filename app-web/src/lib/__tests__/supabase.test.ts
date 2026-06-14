import { describe, it, expect, beforeEach, vi } from "vitest";

describe("getSupabaseClient", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "demo-key";
  });

  it("crea un cliente con método from()", async () => {
    const { getSupabaseClient } = await import("@/lib/supabase");
    const client = getSupabaseClient();
    expect(typeof client.from).toBe("function");
  });

  it("lanza error claro si faltan envs", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const mod = await import("@/lib/supabase");
    expect(() => mod.getSupabaseClient()).toThrow(/SUPABASE_URL/);
  });
});
