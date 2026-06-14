import { describe, it, expect, vi } from "vitest";
import { createGroup, joinGroup, getMyGroups } from "@/lib/groups";

const group = { id: "g1", name: "Familia", invite_code: "ABC123", owner_id: "u1" };

function rpcClient(data: unknown, error: unknown = null) {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) } as never;
}

describe("groups", () => {
  it("createGroup devuelve el grupo creado", async () => {
    expect(await createGroup("Familia", "Fran", rpcClient(group))).toEqual(group);
  });
  it("joinGroup lanza con código inválido", async () => {
    await expect(joinGroup("XXX", "Fran", rpcClient(null, { message: "codigo invalido" })))
      .rejects.toThrow(/codigo invalido/);
  });
  it("getMyGroups lista los grupos del usuario", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [{ groups: group }], error: null }),
      }),
    } as never;
    expect(await getMyGroups(client)).toEqual([group]);
  });
});
