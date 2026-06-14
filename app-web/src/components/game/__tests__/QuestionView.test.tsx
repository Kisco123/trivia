import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionView } from "@/components/game/QuestionView";

const q = {
  slot: "facil" as const,
  category: "historia",
  difficulty: "facil",
  prompt: "¿Capital de Chile?",
  options: ["Lima", "Santiago", "Bogotá", "Quito"],
};

const noop = () => {};

describe("QuestionView", () => {
  it("muestra enunciado y 4 opciones", () => {
    render(<QuestionView question={q} secondsLeft={20} hidden={[]} answeredIndex={null} correctIndex={null} onAnswer={noop} onFiftyFifty={noop} onExtraTime={noop} />);
    expect(screen.getByText("¿Capital de Chile?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Lima|Santiago|Bogotá|Quito/ })).toHaveLength(4);
  });

  it("dispara onAnswer con el índice al tocar una opción", () => {
    const onAnswer = vi.fn();
    render(<QuestionView question={q} secondsLeft={20} hidden={[]} answeredIndex={null} correctIndex={null} onAnswer={onAnswer} onFiftyFifty={noop} onExtraTime={noop} />);
    fireEvent.click(screen.getByRole("button", { name: /Santiago/ }));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it("oculta las opciones indicadas por 50/50", () => {
    render(<QuestionView question={q} secondsLeft={20} hidden={[0, 2]} answeredIndex={null} correctIndex={null} onAnswer={noop} onFiftyFifty={noop} onExtraTime={noop} />);
    expect(screen.queryByRole("button", { name: /Lima/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Santiago/ })).toBeInTheDocument();
  });
});
