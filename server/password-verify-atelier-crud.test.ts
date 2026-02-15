import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
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
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(userId: number = 999): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "regular-user",
    email: "user@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createGuestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Reservation password verification", () => {
  let testReservationId: number;

  it("should create a reservation with guestPassword", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    const result = await caller.reservations.create({
      clientName: "Guest User",
      eventName: "Password Test Event",
      eventType: "concert",
      guestPassword: "test1234",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    testReservationId = result.id;
  });

  it("verifyPassword should succeed with correct password", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    const result = await caller.reservations.verifyPassword({
      id: testReservationId,
      password: "test1234",
    });
    expect(result.success).toBe(true);
  });

  it("verifyPassword should fail with wrong password", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(
      caller.reservations.verifyPassword({
        id: testReservationId,
        password: "wrongpass",
      })
    ).rejects.toThrow("비밀번호가 일치하지 않습니다");
  });

  it("admin can update reservation without password", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.reservations.update({
      id: testReservationId,
      data: { eventName: "Updated by Admin" },
    });
    const updated = await caller.reservations.getById({ id: testReservationId });
    expect(updated?.eventName).toBe("Updated by Admin");
  });

  it("guest can update reservation with correct password", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await caller.reservations.update({
      id: testReservationId,
      guestPassword: "test1234",
      data: { eventName: "Updated by Guest" },
    });
    const updated = await caller.reservations.getById({ id: testReservationId });
    expect(updated?.eventName).toBe("Updated by Guest");
  });

  it("guest cannot update reservation with wrong password", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(
      caller.reservations.update({
        id: testReservationId,
        guestPassword: "wrongpass",
        data: { eventName: "Should Not Update" },
      })
    ).rejects.toThrow("비밀번호가 일치하지 않습니다");
  });

  it("guest cannot update reservation without password", async () => {
    const caller = appRouter.createCaller(createGuestContext());
    await expect(
      caller.reservations.update({
        id: testReservationId,
        data: { eventName: "Should Not Update" },
      })
    ).rejects.toThrow("수정 권한이 없습니다");
  });

  // Cleanup
  it("cleanup: delete test reservation", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.reservations.delete({ id: testReservationId });
  });
});

describe("Atelier01 posts CRUD", () => {
  let testPostId: number;

  it("admin can create atelier01 post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.posts.create({
      title: "DIY Test Post",
      content: "<p>Test content for atelier01</p>",
      category: "atelier01",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    testPostId = result.id;
  });

  it("created post appears in atelier01 list", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const posts = await caller.posts.list({
      category: "atelier01",
      limit: 50,
      offset: 0,
    });
    const found = posts.find((p: any) => p.id === testPostId);
    expect(found).toBeDefined();
    expect(found?.title).toBe("DIY Test Post");
  });

  it("admin can update atelier01 post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.posts.update({
      id: testPostId,
      title: "Updated DIY Post",
      content: "<p>Updated content</p>",
    });
    const posts = await caller.posts.list({
      category: "atelier01",
      limit: 50,
      offset: 0,
    });
    const found = posts.find((p: any) => p.id === testPostId);
    expect(found?.title).toBe("Updated DIY Post");
  });

  it("admin can delete atelier01 post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.posts.delete({ id: testPostId });
    const posts = await caller.posts.list({
      category: "atelier01",
      limit: 50,
      offset: 0,
    });
    const found = posts.find((p: any) => p.id === testPostId);
    expect(found).toBeUndefined();
  });
});
