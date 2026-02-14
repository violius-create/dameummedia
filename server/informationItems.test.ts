import { describe, it, expect, vi } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getInformationItems: vi.fn().mockResolvedValue([
    {
      id: 1,
      sectionKey: "about",
      title: "담음미디어는",
      items: JSON.stringify(["음악이 보이는 영상을 만듭니다", "열정의 가치를 담는, 담음미디어"]),
      description: "다년간 실제 연주 생활과 지휘자 경험을 한 운영자가 직접 녹음-촬영 및 편집을 합니다.",
      updatedBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      sectionKey: "experiences",
      title: "주요 경력",
      items: JSON.stringify(["전 대우전자(주) 중앙연구소 주임연구원"]),
      description: "",
      updatedBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getInformationItemBySection: vi.fn().mockImplementation(async (sectionKey: string) => {
    if (sectionKey === "about") {
      return {
        id: 1,
        sectionKey: "about",
        title: "담음미디어는",
        items: JSON.stringify(["음악이 보이는 영상을 만듭니다"]),
        description: "소개 설명",
        updatedBy: 1,
      };
    }
    return null;
  }),
  upsertInformationItem: vi.fn().mockImplementation(async (data: any) => ({
    id: 1,
    ...data,
  })),
}));

import * as db from "./db";

describe("Information Items", () => {
  it("should return all information items", async () => {
    const items = await db.getInformationItems();
    expect(items).toHaveLength(2);
    expect(items[0].sectionKey).toBe("about");
    expect(items[1].sectionKey).toBe("experiences");
  });

  it("should return information item by section key", async () => {
    const item = await db.getInformationItemBySection("about");
    expect(item).not.toBeNull();
    expect(item?.sectionKey).toBe("about");
    expect(item?.title).toBe("담음미디어는");
  });

  it("should return null for non-existent section", async () => {
    const item = await db.getInformationItemBySection("nonexistent");
    expect(item).toBeNull();
  });

  it("should upsert information item", async () => {
    const data = {
      sectionKey: "about",
      title: "Updated Title",
      items: JSON.stringify(["Item 1", "Item 2"]),
      description: "Updated description",
      updatedBy: 1,
    };
    const result = await db.upsertInformationItem(data);
    expect(result).toBeDefined();
    expect(result.sectionKey).toBe("about");
    expect(result.title).toBe("Updated Title");
  });

  it("should parse items as JSON array", async () => {
    const items = await db.getInformationItems();
    const aboutItems = JSON.parse(items[0].items);
    expect(Array.isArray(aboutItems)).toBe(true);
    expect(aboutItems).toContain("음악이 보이는 영상을 만듭니다");
  });
});
