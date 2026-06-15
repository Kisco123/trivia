import { describe, it, expect, vi } from "vitest";
import { getGroupRanking, getTrophyWall } from "@/lib/ranking";

const rows = [
  { user_id: "u1", display_name: "Sofía", score: 168, days_played: 3, streak: 3, is_me: false },
  { user_id: "u2", display_name: "Fran", score: 119, days_played: 2, streak: 2, is_me: true },
];
function rpcClient(data: unknown, error: unknown = null) {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) } as never;
}
describe("getGroupRanking", () => {
  it("devuelve las filas del ranking", async () => {
    const res = await getGroupRanking("g1", "semana", rpcClient(rows));
    expect(res).toHaveLength(2);
    expect(res[0].display_name).toBe("Sofía");
    expect(res[1].is_me).toBe(true);
  });
  it("lanza si la RPC da error", async () => {
    await expect(getGroupRanking("g1", "hoy", rpcClient(null, { message: "no autorizado" })))
      .rejects.toThrow(/no autorizado/);
  });
});

describe("getTrophyWall", () => {
  it("devuelve los campeones de semanas pasadas", async () => {
    const champs = [{ week_start: "2026-06-08", display_name: "Sofía", score: 980 }];
    const res = await getTrophyWall("g1", rpcClient(champs));
    expect(res).toHaveLength(1);
    expect(res[0].display_name).toBe("Sofía");
  });
});
