import { describe, expect, it } from "vitest";
import { canSubmitComment } from "@/lib/rate-limit";

describe("canSubmitComment", () => {
  it("allows requests within the window limit", () => {
    const key = `ok-${Date.now()}`;

    expect(canSubmitComment(key, 2, 1000)).toBe(true);
    expect(canSubmitComment(key, 2, 1000)).toBe(true);
  });

  it("blocks requests above the window limit", () => {
    const key = `blocked-${Date.now()}`;

    expect(canSubmitComment(key, 1, 1000)).toBe(true);
    expect(canSubmitComment(key, 1, 1000)).toBe(false);
  });
});
