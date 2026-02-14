import { describe, expect, it, vi, beforeEach } from "vitest";
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

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
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

describe("Bug Fix: Information Items", () => {
  it("informationItems.list returns data from DB", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const items = await caller.informationItems.list();
    
    // After DB cleanup, each sectionKey should have exactly 1 row
    expect(Array.isArray(items)).toBe(true);
    
    // Check that we have the expected sections
    const sectionKeys = items.map((item: any) => item.sectionKey);
    expect(sectionKeys).toContain("about");
    expect(sectionKeys).toContain("experiences");
    expect(sectionKeys).toContain("achievements");
    expect(sectionKeys).toContain("dramaWorks");
    
    // Each sectionKey should appear exactly once (no duplicates)
    const uniqueKeys = new Set(sectionKeys);
    expect(uniqueKeys.size).toBe(sectionKeys.length);
  });

  it("informationItems.getBySection returns correct section data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const experiences = await caller.informationItems.getBySection({ sectionKey: "experiences" });
    expect(experiences).not.toBeNull();
    expect(experiences?.title).toBe("주요 경력");
    expect(experiences?.sectionKey).toBe("experiences");
    
    // Items should be a valid JSON array
    const items = JSON.parse(experiences!.items);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it("informationItems.upsert updates existing section correctly", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Update achievements section
    const updatedItems = JSON.stringify(["테스트 실적 1", "테스트 실적 2"]);
    const result = await caller.informationItems.upsert({
      sectionKey: "achievements",
      title: "주요 실적 (수정됨)",
      items: updatedItems,
      description: "테스트 설명",
    });
    
    expect(result).not.toBeNull();
    
    // Verify the update
    const updated = await caller.informationItems.getBySection({ sectionKey: "achievements" });
    expect(updated?.title).toBe("주요 실적 (수정됨)");
    expect(updated?.items).toBe(updatedItems);
    
    // Restore original data
    await caller.informationItems.upsert({
      sectionKey: "achievements",
      title: "주요 실적",
      items: JSON.stringify([
        "400여개의 오케스트레이션 및 악보 제작 판매중",
        "영화음악 편곡, 녹음 및 자문 (정승필 실종사건, 노리개, 커피메이트)",
        "다수의 드라마 녹음용 악보 및 String 편곡 작업",
        "뮤지컬 음악 작곡 (알로하오에)",
        "세계 최초 온라인 콘서트 '아,대한민국!' 프로듀싱 및 음반제작 (2005)",
        "500여건의 녹음 및 촬영, 300여건의 음반 및 DVD 제작",
        "직장인 밴드에서 바이올린 및 베이스 주자로 활동",
      ]),
      description: "",
    });
  });
});

describe("Bug Fix: Admin Board Access Control", () => {
  it("admin_board posts are accessible to admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const posts = await caller.posts.list({ category: "admin_board", limit: 10 });
    expect(Array.isArray(posts)).toBe(true);
    // We know there are 2 migrated posts
    expect(posts.length).toBeGreaterThanOrEqual(2);
  });

  it("admin_board posts are NOT accessible to regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const posts = await caller.posts.list({ category: "admin_board", limit: 10 });
    expect(posts).toEqual([]);
  });

  it("admin_board posts are NOT accessible to public (unauthenticated)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const posts = await caller.posts.list({ category: "admin_board", limit: 10 });
    expect(posts).toEqual([]);
  });

  it("admin_board count returns 0 for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const count = await caller.posts.count({ category: "admin_board" });
    expect(count).toBe(0);
  });

  it("admin_board count returns correct count for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const count = await caller.posts.count({ category: "admin_board" });
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
