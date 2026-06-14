import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  ensureSession: vi.fn().mockResolvedValue(undefined),
  getDisplayName: vi.fn().mockResolvedValue("Fran"),
  setDisplayName: vi.fn().mockResolvedValue(undefined),
  getCurrentUserId: vi.fn().mockResolvedValue("u1"),
}));

vi.mock("@/lib/groups", () => ({
  getMyGroups: vi.fn().mockResolvedValue([
    { id: "g1", name: "Familia", invite_code: "ABC123", owner_id: "u1" },
  ]),
  createGroup: vi.fn(),
  joinGroup: vi.fn(),
}));

import { GroupsLobby } from "@/components/groups/GroupsLobby";

describe("GroupsLobby", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista los grupos del usuario", async () => {
    render(<GroupsLobby />);
    await waitFor(() => expect(screen.getByText("Familia")).toBeInTheDocument());
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });
});
