import { describe, expect, it } from "vitest";
import { commentCreateSchema, loginSchema } from "@/lib/validation";

describe("validation schemas", () => {
  it("validates admin login payloads", () => {
    const parsed = loginSchema.parse({
      email: "admin@example.com",
      password: "change-me-please"
    });

    expect(parsed.email).toBe("admin@example.com");
  });

  it("rejects short comments", () => {
    const result = commentCreateSchema.safeParse({
      postId: "post_1",
      nickname: "AQ",
      email: "aq@example.com",
      content: "短"
    });

    expect(result.success).toBe(false);
  });
});
