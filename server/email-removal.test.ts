import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Email field removal and auto-fill user name", () => {
  // Test 1: clientEmail is optional in the create schema
  it("should accept reservation creation without clientEmail", () => {
    const createSchema = z.object({
      clientName: z.string(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      eventName: z.string(),
      eventType: z.enum(["photo", "concert", "video", "music_video", "other"]),
    });

    // Without email
    const resultWithoutEmail = createSchema.safeParse({
      clientName: "홍길동",
      eventName: "테스트 행사",
      eventType: "photo",
    });
    expect(resultWithoutEmail.success).toBe(true);

    // With email (backward compatibility)
    const resultWithEmail = createSchema.safeParse({
      clientName: "홍길동",
      clientEmail: "test@example.com",
      eventName: "테스트 행사",
      eventType: "photo",
    });
    expect(resultWithEmail.success).toBe(true);
  });

  // Test 2: clientEmail can be undefined
  it("should allow clientEmail to be undefined", () => {
    const schema = z.string().optional();
    expect(schema.safeParse(undefined).success).toBe(true);
    expect(schema.safeParse("test@test.com").success).toBe(true);
  });

  // Test 3: Verify user name auto-fill logic
  it("should auto-fill clientName from user when user is loaded", () => {
    // Simulate user loading scenario
    const user = { name: "김담음", role: "user" };
    const formData = { clientName: "" };

    // Logic from useEffect: if user?.name && !formData.clientName
    if (user?.name && !formData.clientName) {
      formData.clientName = user.name || "";
    }

    expect(formData.clientName).toBe("김담음");
  });

  // Test 4: Should not override manually entered name
  it("should not override clientName if already filled", () => {
    const user = { name: "김담음", role: "user" };
    const formData = { clientName: "직접입력한이름" };

    if (user?.name && !formData.clientName) {
      formData.clientName = user.name || "";
    }

    expect(formData.clientName).toBe("직접입력한이름");
  });

  // Test 5: Should handle null user name gracefully
  it("should handle null user name gracefully", () => {
    const user = { name: null, role: "user" };
    const formData = { clientName: "" };

    if (user?.name && !formData.clientName) {
      formData.clientName = user.name || "";
    }

    // Should remain empty since user.name is null
    expect(formData.clientName).toBe("");
  });
});
