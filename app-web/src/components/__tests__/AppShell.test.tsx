import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/AppShell";

describe("AppShell", () => {
  it("renderiza children dentro de un contenedor mobile", () => {
    render(<AppShell><p>hola</p></AppShell>);
    expect(screen.getByText("hola")).toBeInTheDocument();
  });
});
