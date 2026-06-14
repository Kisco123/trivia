import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/hooks/useCountdown";

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("arranca en el valor inicial", () => {
    const { result } = renderHook(() => useCountdown(20, true));
    expect(result.current.secondsLeft).toBe(20);
  });
  it("decrementa con el tiempo", () => {
    const { result } = renderHook(() => useCountdown(20, true));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.secondsLeft).toBe(17);
  });
  it("no baja de 0", () => {
    const { result } = renderHook(() => useCountdown(2, true));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.secondsLeft).toBe(0);
  });
  it("no corre si running es false", () => {
    const { result } = renderHook(() => useCountdown(20, false));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.secondsLeft).toBe(20);
  });
});
