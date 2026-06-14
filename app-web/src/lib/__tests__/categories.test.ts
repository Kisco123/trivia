import { describe, it, expect } from "vitest";
import { CATEGORIES, getCategory } from "@/lib/categories";

describe("categories", () => {
  it("cada categoría tiene id, label, emoji y color", () => {
    for (const c of CATEGORIES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.emoji).toBeTruthy();
      expect(c.color).toMatch(/^#/);
    }
  });

  it("getCategory devuelve la categoría por id", () => {
    expect(getCategory("historia").label).toBe("Historia");
  });

  it("getCategory hace fallback a 'general' si no existe", () => {
    expect(getCategory("inexistente").id).toBe("general");
  });
});
