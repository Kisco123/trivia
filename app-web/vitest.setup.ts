import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom no implementa canvas; lo dejamos en null para que el confeti se omita en tests.
HTMLCanvasElement.prototype.getContext = (() => null) as never;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
