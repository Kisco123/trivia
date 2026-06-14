import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GameClient } from "@/components/game/GameClient";

const set = [
  { id: "q1", date: "2026-06-14", slot: "facil", category: "historia", difficulty: "facil", prompt: "P1", options: ["a", "b", "c", "d"] },
  { id: "q2", date: "2026-06-14", slot: "media", category: "ciencia", difficulty: "media", prompt: "P2", options: ["a", "b", "c", "d"] },
  { id: "q3", date: "2026-06-14", slot: "dificil", category: "arte", difficulty: "dificil", prompt: "P3", options: ["a", "b", "c", "d"] },
];

const okClient = { rpc: vi.fn().mockResolvedValue({ data: { correct: true, correctIndex: 0 }, error: null }) } as never;

describe("GameClient", () => {
  beforeEach(() => localStorage.clear());

  it("avanza por las 3 preguntas y muestra el resultado", async () => {
    render(<GameClient date="2026-06-14" questions={set as never} questionIds={["q1","q2","q3"]} client={okClient} revealMs={0} />);
    expect(screen.getByText("P1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^A/ }));
    await waitFor(() => screen.getByText("P2"));
    fireEvent.click(screen.getByRole("button", { name: /^A/ }));
    await waitFor(() => screen.getByText("P3"));
    fireEvent.click(screen.getByRole("button", { name: /^A/ }));
    await waitFor(() => screen.getByText(/Tu puntaje de hoy/));
    expect(localStorage.getItem("trivia:played:2026-06-14")).not.toBeNull();
  });
});
