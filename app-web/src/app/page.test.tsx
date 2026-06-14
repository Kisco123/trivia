import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("muestra el título y un CTA de jugar", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /trivia/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jugar/i })).toBeInTheDocument();
  });
});
