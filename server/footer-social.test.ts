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

describe("Footer Settings: Social Media URLs", () => {
  it("footerSettings.get returns youtubeUrl and instagramUrl fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const settings = await caller.footerSettings.get();
    
    expect(settings).not.toBeNull();
    // Verify social media URL fields exist
    expect(settings).toHaveProperty("youtubeUrl");
    expect(settings).toHaveProperty("instagramUrl");
  });

  it("footerSettings.get returns valid YouTube and Instagram URLs", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const settings = await caller.footerSettings.get();
    
    expect(settings).not.toBeNull();
    // Check that URLs contain expected patterns
    if (settings!.youtubeUrl) {
      expect(settings!.youtubeUrl).toContain("youtube.com");
    }
    if (settings!.instagramUrl) {
      expect(settings!.instagramUrl).toContain("instagram.com");
    }
  });

  it("admin can update social media URLs via footerSettings.update", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // Get current settings to preserve them
    const current = await caller.footerSettings.get();
    
    // Update with new social media URLs
    const testYoutubeUrl = "https://www.youtube.com/@test_channel";
    const testInstagramUrl = "https://www.instagram.com/test_account/";
    
    await caller.footerSettings.update({
      youtubeUrl: testYoutubeUrl,
      instagramUrl: testInstagramUrl,
    });
    
    // Verify the update
    const updated = await caller.footerSettings.get();
    expect(updated!.youtubeUrl).toBe(testYoutubeUrl);
    expect(updated!.instagramUrl).toBe(testInstagramUrl);
    
    // Restore original values
    await caller.footerSettings.update({
      youtubeUrl: current?.youtubeUrl || "https://www.youtube.com/@dameum_media",
      instagramUrl: current?.instagramUrl || "https://www.instagram.com/dameum_media/",
    });
  });
});

describe("Admin Board: Original Dates", () => {
  it("admin_board posts have original creation dates (not all same date)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const posts = await caller.posts.list({ category: "admin_board", limit: 20 });
    expect(posts.length).toBeGreaterThan(0);
    
    // Collect unique dates (year-month-day)
    const uniqueDates = new Set(
      posts.map((p: any) => new Date(p.createdAt).toISOString().split("T")[0])
    );
    
    // With original dates migrated, we should have multiple different dates
    expect(uniqueDates.size).toBeGreaterThan(1);
  });

  it("admin_board posts are sorted by date descending", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const posts = await caller.posts.list({ category: "admin_board", limit: 10 });
    expect(posts.length).toBeGreaterThan(1);
    
    // Check descending order
    for (let i = 1; i < posts.length; i++) {
      const prevDate = new Date((posts as any)[i - 1].createdAt).getTime();
      const currDate = new Date((posts as any)[i].createdAt).getTime();
      expect(prevDate).toBeGreaterThanOrEqual(currDate);
    }
  });
});
