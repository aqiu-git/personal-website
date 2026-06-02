import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "@/lib/security";

const requestLike = (origin: string | null, host: string | null) =>
  ({
    headers: {
      get: (key: string) => {
        if (key === "origin") {
          return origin;
        }

        if (key === "host") {
          return host;
        }

        return null;
      }
    }
  }) as Parameters<typeof isSameOriginRequest>[0];

describe("isSameOriginRequest", () => {
  it("allows same-origin requests", () => {
    expect(isSameOriginRequest(requestLike("http://localhost:3000", "localhost:3000"))).toBe(true);
  });

  it("blocks cross-origin requests", () => {
    expect(isSameOriginRequest(requestLike("https://example.com", "localhost:3000"))).toBe(false);
  });
});
