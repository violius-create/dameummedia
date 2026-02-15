import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createPublicContext(): TrpcContext {
  return { user: null } as TrpcContext;
}

describe("Auth Register & Login - DB layer", () => {
  it("should create a local user via DB helper", async () => {
    const uniqueUsername = `testuser_${Date.now()}`;
    const user = await db.createLocalUser({
      username: uniqueUsername,
      name: "테스트 사용자",
      passwordHash: "hashedpassword123",
    });
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.openId).toContain("local_");
  });
});

describe("Reservation Guest Password", () => {
  it("should accept reservation with guestPassword", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reservations.create({
      clientName: "비회원 테스트",
      clientEmail: "guest@test.com",
      eventName: "비회원 예약 테스트",
      eventType: "photo",
      guestPassword: "guest1234",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });

  it("should store guestPassword in reservation", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const created = await caller.reservations.create({
      clientName: "비밀번호 저장 테스트",
      clientEmail: "pwtest@test.com",
      eventName: "비밀번호 저장 확인",
      eventType: "concert",
      guestPassword: "secret123",
    });
    const reservation = await caller.reservations.getById({ id: created.id });
    expect(reservation).toBeDefined();
    expect(reservation!.guestPassword).toBe("secret123");
  });

  it("should accept reservation without guestPassword", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reservations.create({
      clientName: "회원 테스트",
      clientEmail: "member@test.com",
      eventName: "회원 예약 테스트",
      eventType: "concert",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });
});
