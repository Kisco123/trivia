import { describe, it, expect, vi } from "vitest";
import { submitAnswer, requestFiftyFifty } from "@/lib/gameplay";

function clientReturning(data: unknown) {
  return { rpc: vi.fn().mockResolvedValue({ data, error: null }) } as never;
}

describe("submitAnswer", () => {
  it("devuelve correct y correctIndex desde la RPC", async () => {
    const client = clientReturning({ correct: true, correctIndex: 2 });
    const res = await submitAnswer("q1", 2, client);
    expect(res).toEqual({ correct: true, correctIndex: 2 });
  });
  it("lanza si la RPC da error", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }) } as never;
    await expect(submitAnswer("q1", 0, client)).rejects.toThrow(/boom/);
  });
});

describe("requestFiftyFifty", () => {
  it("devuelve los índices a ocultar", async () => {
    const client = clientReturning([0, 3]);
    expect(await requestFiftyFifty("q1", client)).toEqual([0, 3]);
  });
});
