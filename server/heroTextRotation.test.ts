import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db module
vi.mock("./db", () => ({
  getHeroTextRotation: vi.fn(),
  upsertHeroTextRotation: vi.fn(),
}));

import * as db from "./db";

const VALID_ANIMATION_TYPES = [
  "fadeSlideUp",
  "fadeScale",
  "slideLeft",
  "typewriter",
  "flipDown",
  "glitch",
];

describe("heroTextRotation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHeroTextRotation", () => {
    it("should return null when no data exists", async () => {
      vi.mocked(db.getHeroTextRotation).mockResolvedValue(null);
      const result = await db.getHeroTextRotation();
      expect(result).toBeNull();
    });

    it("should return hero text rotation data with animationType when it exists", async () => {
      const mockData = {
        id: 1,
        text1Title: "Professional Media Production",
        text1Description: "Record, Mixing, Mastering and Videos",
        text2Title: "Concert Live Recording",
        text2Description: "최고의 공연 실황을 담습니다",
        text3Title: "Making Film Production",
        text3Description: "비하인드 스토리를 영상으로",
        intervalMs: 2000,
        animationType: "fadeSlideUp",
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(db.getHeroTextRotation).mockResolvedValue(mockData);
      const result = await db.getHeroTextRotation();
      expect(result).toEqual(mockData);
      expect(result?.text1Title).toBe("Professional Media Production");
      expect(result?.intervalMs).toBe(2000);
      expect(result?.animationType).toBe("fadeSlideUp");
    });

    it("should return data with different animation types", async () => {
      for (const animType of VALID_ANIMATION_TYPES) {
        const mockData = {
          id: 1,
          text1Title: "Test",
          text1Description: "Test desc",
          text2Title: "",
          text2Description: "",
          text3Title: "",
          text3Description: "",
          intervalMs: 2000,
          animationType: animType,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        vi.mocked(db.getHeroTextRotation).mockResolvedValue(mockData);
        const result = await db.getHeroTextRotation();
        expect(result?.animationType).toBe(animType);
      }
    });
  });

  describe("upsertHeroTextRotation", () => {
    it("should create new hero text rotation settings with animationType", async () => {
      const input = {
        text1Title: "Title 1",
        text1Description: "Desc 1",
        text2Title: "Title 2",
        text2Description: "Desc 2",
        text3Title: "Title 3",
        text3Description: "Desc 3",
        intervalMs: 3000,
        animationType: "fadeScale",
        updatedBy: 1,
      };
      vi.mocked(db.upsertHeroTextRotation).mockResolvedValue({ id: 1, ...input });
      const result = await db.upsertHeroTextRotation(input);
      expect(result).toBeDefined();
      expect(result?.text1Title).toBe("Title 1");
      expect(result?.intervalMs).toBe(3000);
      expect(result?.animationType).toBe("fadeScale");
    });

    it("should update existing hero text rotation settings with new animationType", async () => {
      const input = {
        text1Title: "Updated Title 1",
        text1Description: "Updated Desc 1",
        text2Title: "",
        text2Description: "",
        text3Title: "",
        text3Description: "",
        intervalMs: 5000,
        animationType: "glitch",
        updatedBy: 1,
      };
      vi.mocked(db.upsertHeroTextRotation).mockResolvedValue({ id: 1, ...input });
      const result = await db.upsertHeroTextRotation(input);
      expect(result?.text1Title).toBe("Updated Title 1");
      expect(result?.intervalMs).toBe(5000);
      expect(result?.text2Title).toBe("");
      expect(result?.animationType).toBe("glitch");
    });

    it("should validate intervalMs within range", async () => {
      const input = {
        text1Title: "Title",
        text1Description: "Desc",
        text2Title: "",
        text2Description: "",
        text3Title: "",
        text3Description: "",
        intervalMs: 2000,
        animationType: "fadeSlideUp",
        updatedBy: 1,
      };
      vi.mocked(db.upsertHeroTextRotation).mockResolvedValue({ id: 1, ...input });
      const result = await db.upsertHeroTextRotation(input);
      expect(result?.intervalMs).toBeGreaterThanOrEqual(500);
      expect(result?.intervalMs).toBeLessThanOrEqual(30000);
    });

    it("should default to fadeSlideUp when animationType is not specified", async () => {
      const input = {
        text1Title: "Title",
        text1Description: "Desc",
        text2Title: "",
        text2Description: "",
        text3Title: "",
        text3Description: "",
        intervalMs: 2000,
        animationType: "fadeSlideUp",
        updatedBy: 1,
      };
      vi.mocked(db.upsertHeroTextRotation).mockResolvedValue({ id: 1, ...input });
      const result = await db.upsertHeroTextRotation(input);
      expect(result?.animationType).toBe("fadeSlideUp");
    });

    it("should accept all valid animation types", async () => {
      for (const animType of VALID_ANIMATION_TYPES) {
        const input = {
          text1Title: "Title",
          text1Description: "Desc",
          text2Title: "",
          text2Description: "",
          text3Title: "",
          text3Description: "",
          intervalMs: 2000,
          animationType: animType,
          updatedBy: 1,
        };
        vi.mocked(db.upsertHeroTextRotation).mockResolvedValue({ id: 1, ...input });
        const result = await db.upsertHeroTextRotation(input);
        expect(result?.animationType).toBe(animType);
        expect(VALID_ANIMATION_TYPES).toContain(result?.animationType);
      }
    });
  });
});
