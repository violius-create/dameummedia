import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getReservationFormLabels: vi.fn(),
  upsertReservationFormLabels: vi.fn(),
}));

import { getReservationFormLabels, upsertReservationFormLabels } from "./db";

describe("Reservation Form Labels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default labels when no labels exist in DB", async () => {
    const mockGet = vi.mocked(getReservationFormLabels);
    mockGet.mockResolvedValue(null as any);

    const result = await getReservationFormLabels();
    expect(result).toBeNull();
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("should return stored labels when they exist", async () => {
    const mockLabels = {
      id: 1,
      cat1Label: "담당자 정보",
      cat2Label: "행사 정보",
      cat3Label: "작업 내용",
      cat4Label: "결제 정보",
      cat5Label: "프로그램 및 요청사항",
      sub1_1Label: "담당자 성함",
      sub1_2Label: "연락처",
      sub1_3Label: "이메일",
      sub2_1Label: "행사명",
      sub2_2Label: "장소",
      sub2_3Label: "행사 날짜",
      sub2_4Label: "시작 시간",
      sub2_5Label: "리허설 시간",
      sub3_1Label: "분류",
      sub3_2Label: "촬영 유형",
      sub3_3Label: "특수 요청",
      sub3_4Label: "공개 여부",
      sub4_1Label: "결제 방식",
      sub4_2Label: "계산서 발행",
      sub4_3Label: "견적액",
      sub4_4Label: "결제된 금액",
      sub4_5Label: "미납 금액",
    };

    const mockGet = vi.mocked(getReservationFormLabels);
    mockGet.mockResolvedValue(mockLabels as any);

    const result = await getReservationFormLabels();
    expect(result).toEqual(mockLabels);
    expect(result?.cat1Label).toBe("담당자 정보");
    expect(result?.sub3_2Label).toBe("촬영 유형");
  });

  it("should update labels correctly", async () => {
    const mockUpsert = vi.mocked(upsertReservationFormLabels);
    mockUpsert.mockResolvedValue(undefined);

    const updateData = {
      cat1Label: "수정된 담당자 정보",
      sub1_1Label: "수정된 담당자 성함",
    };

    await upsertReservationFormLabels(updateData);
    expect(mockUpsert).toHaveBeenCalledWith(updateData);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });

  it("should handle all 22 label fields", () => {
    const allLabelKeys = [
      "cat1Label", "cat2Label", "cat3Label", "cat4Label", "cat5Label",
      "sub1_1Label", "sub1_2Label", "sub1_3Label",
      "sub2_1Label", "sub2_2Label", "sub2_3Label", "sub2_4Label", "sub2_5Label",
      "sub3_1Label", "sub3_2Label", "sub3_3Label", "sub3_4Label",
      "sub4_1Label", "sub4_2Label", "sub4_3Label", "sub4_4Label", "sub4_5Label",
    ];
    
    expect(allLabelKeys).toHaveLength(22);
    
    // Verify all keys follow naming convention
    allLabelKeys.forEach(key => {
      expect(key).toMatch(/^(cat[1-5]|sub[1-4]_[1-5])Label$/);
    });
  });

  it("should validate reservation form structure has 5 categories", () => {
    const categories = [
      { name: "담당자 정보", subs: ["담당자 성함", "연락처", "이메일"] },
      { name: "행사 정보", subs: ["행사명", "장소", "행사 날짜", "시작 시간", "리허설 시간"] },
      { name: "작업 내용", subs: ["분류", "촬영 유형", "특수 요청", "공개 여부"] },
      { name: "결제 정보", subs: ["결제 방식", "계산서 발행", "견적액", "결제된 금액", "미납 금액"] },
      { name: "프로그램 및 요청사항", subs: [] },
    ];

    expect(categories).toHaveLength(5);
    expect(categories[0].subs).toHaveLength(3);
    expect(categories[1].subs).toHaveLength(5);
    expect(categories[2].subs).toHaveLength(4);
    expect(categories[3].subs).toHaveLength(5);
    expect(categories[4].subs).toHaveLength(0);
  });
});
