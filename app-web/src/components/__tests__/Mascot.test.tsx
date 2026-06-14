import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Mascot } from "@/components/Mascot";

describe("Mascot", () => {
  it("muestra la expresión por defecto (neutral)", () => {
    render(<Mascot />);
    expect(screen.getByRole("img", { name: /búho/i })).toHaveTextContent("🦉");
  });

  it("cambia el glyph según la expresión", () => {
    render(<Mascot expression="happy" />);
    expect(screen.getByRole("img", { name: /búho/i })).toHaveTextContent("😄");
  });
});
