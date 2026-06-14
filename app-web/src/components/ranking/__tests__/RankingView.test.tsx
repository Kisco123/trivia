import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RankingView } from "@/components/ranking/RankingView";

const rows = [
  { user_id: "u1", display_name: "Sofía", score: 168, days_played: 3, streak: 3, is_me: false },
  { user_id: "u2", display_name: "Martín", score: 142, days_played: 3, streak: 1, is_me: false },
  { user_id: "u3", display_name: "Diego", score: 128, days_played: 2, streak: 0, is_me: false },
  { user_id: "u4", display_name: "Fran", score: 119, days_played: 2, streak: 2, is_me: true },
];

describe("RankingView", () => {
  it("muestra a los jugadores y sus puntajes", () => {
    render(<RankingView rows={rows} period="semana" onPeriodChange={() => {}} />);
    expect(screen.getByText("Sofía")).toBeInTheDocument();
    expect(screen.getByText("168")).toBeInTheDocument();
  });
  it("dispara onPeriodChange al tocar una pestaña", () => {
    const onChange = vi.fn();
    render(<RankingView rows={rows} period="semana" onPeriodChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Hoy/ }));
    expect(onChange).toHaveBeenCalledWith("hoy");
  });
  it("resalta la fila propia", () => {
    render(<RankingView rows={rows} period="semana" onPeriodChange={() => {}} />);
    expect(screen.getByText("Fran").closest('[data-me="true"]')).not.toBeNull();
  });
});
