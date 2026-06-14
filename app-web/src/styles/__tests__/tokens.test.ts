import { describe, it, expect } from "vitest";
import { colors } from "@/styles/tokens";

describe("design tokens", () => {
  it("expone la paleta core con valores hex", () => {
    expect(colors.bg).toBe("#0a0e1a");
    expect(colors.violet).toBe("#7c5cff");
    expect(colors.orange).toBe("#ff8a4c");
    expect(colors.success).toBe("#4ade80");
  });
});
