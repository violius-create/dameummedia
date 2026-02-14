import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => {
  let mockBranding: any = {
    id: 1,
    logoUrl: null,
    logoFileKey: null,
    title: "담음미디어",
    subtitle: "Professional Media Production",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
    heroFadeStart: 20,
    heroFadeEnd: 60,
    instagramDisplayCount: 10,
    uploadedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    getSiteBranding: vi.fn(() => Promise.resolve(mockBranding)),
    updateSiteBranding: vi.fn((id: number, data: any) => {
      mockBranding = { ...mockBranding, ...data };
      return Promise.resolve(mockBranding);
    }),
    createOrUpdateSiteBranding: vi.fn((data: any) => {
      mockBranding = { ...mockBranding, ...data, id: 1 };
      return Promise.resolve(mockBranding);
    }),
    // Stub other db exports used by routers
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
    getPosts: vi.fn(() => Promise.resolve([])),
    getAllPosts: vi.fn(() => Promise.resolve([])),
    getPostById: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
    createImage: vi.fn(),
    getImagesByPostId: vi.fn(() => Promise.resolve([])),
    deleteImage: vi.fn(),
    createReservation: vi.fn(),
    getReservations: vi.fn(() => Promise.resolve([])),
    getReservationById: vi.fn(),
    updateReservation: vi.fn(),
    deleteReservation: vi.fn(),
    createComment: vi.fn(),
    getCommentsByPostId: vi.fn(() => Promise.resolve([])),
    deleteComment: vi.fn(),
    getGalleryItems: vi.fn(() => Promise.resolve([])),
    getGalleryItemById: vi.fn(),
    createGalleryItem: vi.fn(),
    updateGalleryItem: vi.fn(),
    deleteGalleryItem: vi.fn(),
    getActiveHeroBackground: vi.fn(),
    getActiveHeroBackgroundBySection: vi.fn(),
    getHeroBackgrounds: vi.fn(() => Promise.resolve([])),
    getHeroBackgroundById: vi.fn(),
    createHeroBackground: vi.fn(),
    updateHeroBackground: vi.fn(),
    deleteHeroBackground: vi.fn(),
    getServiceItems: vi.fn(() => Promise.resolve([])),
    getServiceItemById: vi.fn(),
    getServiceItemByKey: vi.fn(),
    createServiceItem: vi.fn(),
    updateServiceItem: vi.fn(),
    deleteServiceItem: vi.fn(),
    getInstagramPosts: vi.fn(() => Promise.resolve([])),
    getInstagramPostById: vi.fn(),
    createInstagramPost: vi.fn(),
    updateInstagramPost: vi.fn(),
    deleteInstagramPost: vi.fn(),
    getSectionTitles: vi.fn(() => Promise.resolve([])),
    getSectionTitleByKey: vi.fn(),
    createSectionTitle: vi.fn(),
    updateSectionTitle: vi.fn(),
    getFooterSettings: vi.fn(),
    createFooterSettings: vi.fn(),
    updateFooterSettings: vi.fn(),
    getBoardLayoutSettings: vi.fn(),
    getAllBoardLayoutSettings: vi.fn(() => Promise.resolve([])),
    createBoardLayoutSettings: vi.fn(),
    updateBoardLayoutSettings: vi.fn(),
    getPricePackages: vi.fn(() => Promise.resolve([])),
    getPricePackageById: vi.fn(),
    createPricePackage: vi.fn(),
    updatePricePackage: vi.fn(),
    deletePricePackage: vi.fn(),
    getPriceAddOns: vi.fn(() => Promise.resolve([])),
    getPriceAddOnById: vi.fn(),
    createPriceAddOn: vi.fn(),
    updatePriceAddOn: vi.fn(),
    deletePriceAddOn: vi.fn(),
    getHeroTextRotation: vi.fn(),
    createHeroTextRotation: vi.fn(),
    updateHeroTextRotation: vi.fn(),
    getInformationItems: vi.fn(() => Promise.resolve([])),
    getInformationItemById: vi.fn(),
    createInformationItem: vi.fn(),
    updateInformationItem: vi.fn(),
    deleteInformationItem: vi.fn(),
    getFeaturedPost: vi.fn(),
    getDb: vi.fn(),
  };
});

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

describe("siteBranding - instagramDisplayCount", () => {
  it("returns instagramDisplayCount in siteBranding.get", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.siteBranding.get();

    expect(result).not.toBeNull();
    expect(result?.instagramDisplayCount).toBe(10);
  });

  it("allows admin to update instagramDisplayCount", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.siteBranding.update({
      instagramDisplayCount: 20,
    });

    // Verify the update was called with correct value
    const db = await import("./db");
    expect(db.updateSiteBranding).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        instagramDisplayCount: 20,
      })
    );
  });

  it("validates instagramDisplayCount range (min 1)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.siteBranding.update({
        instagramDisplayCount: 0,
      })
    ).rejects.toThrow();
  });

  it("validates instagramDisplayCount range (max 50)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.siteBranding.update({
        instagramDisplayCount: 51,
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users from updating", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.siteBranding.update({
        instagramDisplayCount: 15,
      })
    ).rejects.toThrow();
  });
});
