import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedAdmin = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedAdmin = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Post Edit Functionality", () => {
  it("should update a post successfully with all fields", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a post first
    const created = await caller.posts.create({
      title: "Original Title",
      content: "Original Content",
      category: "concert",
      imageUrl: "https://example.com/original.jpg",
      videoUrl: "https://youtube.com/watch?v=original",
    });

    expect(created).toBeDefined();

    // Update the post
    const updated = await caller.posts.update({
      id: created.id,
      title: "Updated Title",
      content: "Updated Content",
      imageUrl: "https://example.com/updated.jpg",
      videoUrl: "https://youtube.com/watch?v=updated",
    });

    expect(updated).toBeDefined();
  });

  it("should update post title only", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a post first
    const created = await caller.posts.create({
      title: "Original Title",
      content: "Original Content",
      category: "film",
      imageUrl: "https://example.com/test.jpg",
    });

    expect(created).toBeDefined();

    // Update only title
    const updated = await caller.posts.update({
      id: created.id,
      title: "Updated Title Only",
    });

    expect(updated).toBeDefined();
  });

  it("should handle empty update gracefully", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a post first
    const created = await caller.posts.create({
      title: "Test Title",
      content: "Test Content",
      category: "notice",
    });

    expect(created).toBeDefined();

    // Update with no changes
    const updated = await caller.posts.update({
      id: created.id,
    });

    expect(updated).toBeDefined();
  });
});
