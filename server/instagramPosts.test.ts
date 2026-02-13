import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => {
  const mockPosts = [
    {
      id: 1,
      imageUrl: "https://example.com/img1.jpg",
      fileKey: "instagram/img1.jpg",
      postUrl: "https://instagram.com/p/abc123",
      caption: "Test caption 1",
      sortOrder: 0,
      isActive: 1,
      uploadedBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      imageUrl: "https://example.com/img2.jpg",
      fileKey: "instagram/img2.jpg",
      postUrl: null,
      caption: null,
      sortOrder: 1,
      isActive: 0,
      uploadedBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return {
    getInstagramPosts: vi.fn((onlyActive: boolean) => {
      if (onlyActive) {
        return Promise.resolve(mockPosts.filter((p) => p.isActive === 1));
      }
      return Promise.resolve(mockPosts);
    }),
    getInstagramPostById: vi.fn((id: number) => {
      return Promise.resolve(mockPosts.find((p) => p.id === id) || null);
    }),
    createInstagramPost: vi.fn((post: any) => {
      return Promise.resolve({
        id: 3,
        ...post,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
    updateInstagramPost: vi.fn((id: number, data: any) => {
      const existing = mockPosts.find((p) => p.id === id);
      if (!existing) return Promise.resolve(null);
      return Promise.resolve({ ...existing, ...data });
    }),
    deleteInstagramPost: vi.fn(() => Promise.resolve(undefined)),
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
    getSiteBranding: vi.fn(),
    createSiteBranding: vi.fn(),
    updateSiteBranding: vi.fn(),
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

describe("instagramPosts router", () => {
  describe("list", () => {
    it("returns only active posts by default (public)", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.instagramPosts.list({ onlyActive: true });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(1);
    });

    it("returns all posts when onlyActive is false", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.instagramPosts.list({ onlyActive: false });

      expect(result).toHaveLength(2);
    });
  });

  describe("getById", () => {
    it("returns a post by id", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.instagramPosts.getById({ id: 1 });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.imageUrl).toBe("https://example.com/img1.jpg");
    });

    it("returns null for non-existent id", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.instagramPosts.getById({ id: 999 });

      expect(result).toBeNull();
    });
  });

  describe("create (admin only)", () => {
    it("creates a new instagram post", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.instagramPosts.create({
        imageUrl: "https://example.com/new.jpg",
        fileKey: "instagram/new.jpg",
        postUrl: "https://instagram.com/p/new123",
        caption: "New post",
        sortOrder: 5,
        isActive: 1,
      });

      expect(result).not.toBeNull();
      expect(result?.imageUrl).toBe("https://example.com/new.jpg");
    });

    it("rejects unauthenticated users", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.instagramPosts.create({
          imageUrl: "https://example.com/new.jpg",
          sortOrder: 0,
          isActive: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("update (admin only)", () => {
    it("updates an existing instagram post", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.instagramPosts.update({
        id: 1,
        caption: "Updated caption",
        sortOrder: 10,
      });

      expect(result).not.toBeNull();
      expect(result?.caption).toBe("Updated caption");
    });
  });

  describe("delete (admin only)", () => {
    it("deletes an instagram post", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      // Should not throw
      await expect(
        caller.instagramPosts.delete({ id: 1 })
      ).resolves.not.toThrow();
    });

    it("rejects unauthenticated users", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.instagramPosts.delete({ id: 1 })
      ).rejects.toThrow();
    });
  });
});
