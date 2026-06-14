import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza el label y dispara onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Jugar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Jugar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("aplica estilo de variante secondary", () => {
    render(<Button variant="secondary">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-white/5");
  });
});
