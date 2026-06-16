import { describe, it, expect, vi } from "vitest";
import { signUp, signIn, getAccountEmail } from "@/lib/account";

describe("account", () => {
  it("signUp convierte la sesión con updateUser", async () => {
    const client = { auth: { updateUser: vi.fn().mockResolvedValue({ error: null }) } } as never;
    await signUp("a@b.com", "secret6", client);
    expect(client.auth.updateUser).toHaveBeenCalledWith({ email: "a@b.com", password: "secret6" });
  });

  it("signIn traduce credenciales inválidas", async () => {
    const client = {
      auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: { message: "Invalid login credentials" } }) },
    } as never;
    await expect(signIn("a@b.com", "x", client)).rejects.toThrow(/incorrectos/);
  });

  it("getAccountEmail devuelve el correo de la cuenta", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { email: "a@b.com" } } }) },
    } as never;
    expect(await getAccountEmail(client)).toBe("a@b.com");
  });
});
