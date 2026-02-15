import { describe, expect, it, vi } from "vitest";
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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Reservation Status Merge: progressStatus is the single source of truth", () => {
  it("all reservations have non-null progressStatus after migration", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const reservations = await caller.reservations.list({ limit: 20, offset: 0 });
    
    expect(Array.isArray(reservations)).toBe(true);
    
    // Every reservation should have a progressStatus value (not null)
    for (const res of reservations) {
      expect(res.progressStatus).toBeTruthy();
      // progressStatus should be a Korean string, not an English enum
      expect(typeof res.progressStatus).toBe("string");
    }
  });

  it("old completed reservations now have progressStatus '작업완료'", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const reservations = await caller.reservations.list({ limit: 50, offset: 0 });
    
    // Find reservations with status 'completed' - they should have progressStatus '작업완료'
    const completedReservations = reservations.filter((r: any) => r.status === "completed");
    for (const res of completedReservations) {
      expect(res.progressStatus).toBe("작업완료");
    }
  });

  it("old cancelled reservations now have progressStatus '취소'", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const reservations = await caller.reservations.list({ limit: 100, offset: 0 });
    
    const cancelledReservations = reservations.filter((r: any) => r.status === "cancelled");
    for (const res of cancelledReservations) {
      expect(res.progressStatus).toBe("취소");
    }
  });

  it("admin can update progressStatus with Korean values", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create a test reservation
    const result = await caller.reservations.create({
      clientName: "통합 테스트",
      clientEmail: "merge@example.com",
      eventName: "진행상황 통합 테스트",
      eventType: "photo",
      progressStatus: "접수중",
      status: "pending",
    });
    
    expect(result).toHaveProperty("id");
    
    // Update progressStatus to Korean value
    await caller.reservations.update({
      id: result.id,
      data: { progressStatus: "작업중" },
    });
    
    // Verify
    const updated = await caller.reservations.getById({ id: result.id });
    expect(updated?.progressStatus).toBe("작업중");
    
    // Clean up
    await caller.reservations.delete({ id: result.id });
  });

  it("reservations.create stores quotedAmount correctly", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.reservations.create({
      clientName: "금액 테스트",
      clientEmail: "amount@example.com",
      eventName: "금액 저장 테스트",
      eventType: "concert",
      quotedAmount: 2500000,
      paidAmount: 1000000,
      status: "pending",
    });
    
    const created = await caller.reservations.getById({ id: result.id });
    expect(created?.quotedAmount).toBe(2500000);
    expect(created?.paidAmount).toBe(1000000);
    
    // Clean up
    await caller.reservations.delete({ id: result.id });
  });
});
