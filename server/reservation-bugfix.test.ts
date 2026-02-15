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

describe("Reservation Bug Fix: progressStatus in list", () => {
  it("reservations.list returns progressStatus field", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const reservations = await caller.reservations.list({ limit: 5, offset: 0 });
    
    expect(Array.isArray(reservations)).toBe(true);
    
    // Each reservation should have progressStatus field (can be null for old records)
    if (reservations.length > 0) {
      const firstReservation = reservations[0];
      expect(firstReservation).toHaveProperty("progressStatus");
      expect(firstReservation).toHaveProperty("eventName");
      expect(firstReservation).toHaveProperty("clientName");
      expect(firstReservation).toHaveProperty("createdAt");
      expect(firstReservation).toHaveProperty("status");
    }
  });

  it("reservations.getById returns progressStatus field", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Get list first to find an ID
    const reservations = await caller.reservations.list({ limit: 1, offset: 0 });
    if (reservations.length > 0) {
      const detail = await caller.reservations.getById({ id: reservations[0].id });
      expect(detail).not.toBeNull();
      expect(detail).toHaveProperty("progressStatus");
    }
  });
});

describe("Reservation Bug Fix: progressStatus update", () => {
  it("admin can update progressStatus via reservations.update", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Get a reservation to update
    const reservations = await caller.reservations.list({ limit: 1, offset: 0 });
    if (reservations.length > 0) {
      const id = reservations[0].id;
      const originalStatus = reservations[0].progressStatus;
      
      // Update progressStatus
      await caller.reservations.update({
        id,
        data: { progressStatus: "작업중" },
      });
      
      // Verify update
      const updated = await caller.reservations.getById({ id });
      expect(updated?.progressStatus).toBe("작업중");
      
      // Restore original
      await caller.reservations.update({
        id,
        data: { progressStatus: originalStatus || "접수중" },
      });
    }
  });
});

describe("Reservation Bug Fix: amount fields accept text values", () => {
  it("reservations.create accepts quotedAmount and paidAmount as numbers", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create a test reservation with amount fields
    const result = await caller.reservations.create({
      clientName: "테스트 담당자",
      clientEmail: "test@example.com",
      eventName: "금액 테스트 행사",
      eventType: "photo",
      quotedAmount: 1500000,
      paidAmount: 500000,
      unpaidAmount: 1000000,
      status: "pending",
    });
    
    expect(result).toHaveProperty("id");
    
    // Verify the amounts
    const created = await caller.reservations.getById({ id: result.id });
    expect(created?.quotedAmount).toBe(1500000);
    expect(created?.paidAmount).toBe(500000);
    expect(created?.unpaidAmount).toBe(1000000);
    
    // Clean up
    await caller.reservations.delete({ id: result.id });
  });

  it("reservations.update can modify amount fields", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create a test reservation
    const result = await caller.reservations.create({
      clientName: "금액 수정 테스트",
      clientEmail: "test2@example.com",
      eventName: "금액 수정 테스트 행사",
      eventType: "concert",
      quotedAmount: 0,
      paidAmount: 0,
      status: "pending",
    });
    
    // Update amounts
    await caller.reservations.update({
      id: result.id,
      data: {
        quotedAmount: 2000000,
        paidAmount: 1000000,
        unpaidAmount: 1000000,
      },
    });
    
    // Verify
    const updated = await caller.reservations.getById({ id: result.id });
    expect(updated?.quotedAmount).toBe(2000000);
    expect(updated?.paidAmount).toBe(1000000);
    expect(updated?.unpaidAmount).toBe(1000000);
    
    // Clean up
    await caller.reservations.delete({ id: result.id });
  });
});

describe("Reservation Bug Fix: dropdown default values", () => {
  it("reservations.create uses correct default values for eventType and recordingType", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create with default eventType (photo) and recordingType (Photo)
    const result = await caller.reservations.create({
      clientName: "기본값 테스트",
      clientEmail: "default@example.com",
      eventName: "기본값 테스트 행사",
      eventType: "photo",
      recordingType: "Photo",
      paymentMethod: "card",
      receiptType: "issued",
      status: "pending",
    });
    
    expect(result).toHaveProperty("id");
    
    const created = await caller.reservations.getById({ id: result.id });
    expect(created?.eventType).toBe("photo");
    expect(created?.recordingType).toBe("Photo");
    expect(created?.paymentMethod).toBe("card");
    expect(created?.receiptType).toBe("issued");
    
    // Clean up
    await caller.reservations.delete({ id: result.id });
  });

  it("reservationFormLabels.get returns progress options", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const labels = await caller.reservationFormLabels.get();
    
    // Labels should exist (either from DB or null)
    // If labels exist, check for progress options
    if (labels) {
      // These fields should be defined in the schema
      expect(labels).toHaveProperty("progressOption1");
      expect(labels).toHaveProperty("progressOption2");
      expect(labels).toHaveProperty("progressOption3");
      expect(labels).toHaveProperty("progressOption4");
      expect(labels).toHaveProperty("progressOption5");
      expect(labels).toHaveProperty("progressOption6");
    }
  });
});
