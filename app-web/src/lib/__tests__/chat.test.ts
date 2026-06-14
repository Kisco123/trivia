import { describe, it, expect, vi } from "vitest";
import { sendMessage, getMessages, toggleReaction } from "@/lib/chat";

describe("chat data layer", () => {
  it("getMessages devuelve los mensajes ordenados", async () => {
    const msgs = [{ id: "m1", body: "hola", display_name: "Fran", user_id: "u1", created_at: "t" }];
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: msgs, error: null }),
          }),
        }),
      }),
    } as never;
    expect(await getMessages("g1", client)).toEqual(msgs);
  });

  it("sendMessage inserta y lanza en error", async () => {
    const client = {
      from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: { message: "boom" } }) }),
    } as never;
    await expect(sendMessage("g1", "u1", "Fran", "hola", client)).rejects.toThrow(/boom/);
  });

  it("toggleReaction inserta cuando no existe", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
        insert,
      }),
    } as never;
    await toggleReaction("m1", "u1", "🔥", client);
    expect(insert).toHaveBeenCalled();
  });
});
