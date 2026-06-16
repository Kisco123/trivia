import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/AppShell";

// Con el muro de cuenta, los children solo se muestran con sesión iniciada.
vi.mock("@/lib/auth", () => ({ ensureSession: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/account", () => ({
  getAccountEmail: vi.fn().mockResolvedValue("test@correo.com"),
  signUp: vi.fn(),
  signIn: vi.fn(),
}));

describe("AppShell", () => {
  it("renderiza children cuando hay cuenta iniciada", async () => {
    render(
      <AppShell>
        <p>hola</p>
      </AppShell>,
    );
    expect(await screen.findByText("hola")).toBeInTheDocument();
  });

  it("muestra el muro de cuenta cuando no hay sesión", async () => {
    const { getAccountEmail } = await import("@/lib/account");
    vi.mocked(getAccountEmail).mockResolvedValueOnce(null);
    render(
      <AppShell>
        <p>secreto</p>
      </AppShell>,
    );
    expect(await screen.findByText("Crear cuenta y jugar")).toBeInTheDocument();
    expect(screen.queryByText("secreto")).not.toBeInTheDocument();
  });
});
