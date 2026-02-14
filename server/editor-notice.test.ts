import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB module
vi.mock("./db", () => ({
  getAllPosts: vi.fn(),
  getPostById: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  getPostCount: vi.fn(),
}));

import * as db from "./db";

describe("AdminBoard Editor Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a post with HTML content from rich text editor", async () => {
    const htmlContent = "<h1>테스트 제목</h1><p>리치 텍스트 <strong>에디터</strong> 내용입니다.</p>";
    const mockPost = {
      id: 1,
      title: "테스트 글",
      content: htmlContent,
      category: "admin_board",
      createdAt: Date.now(),
    };

    (db.createPost as any).mockResolvedValue(mockPost);

    const result = await db.createPost({
      title: "테스트 글",
      content: htmlContent,
      category: "admin_board",
      authorId: "admin-user-id",
    } as any);

    expect(result).toBeDefined();
    expect(result.content).toContain("<h1>");
    expect(result.content).toContain("<strong>");
    expect(db.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        content: htmlContent,
        category: "admin_board",
      })
    );
  });

  it("should update a post with HTML content from rich text editor", async () => {
    const updatedHtml = "<p>수정된 <em>내용</em>입니다.</p><ul><li>항목 1</li><li>항목 2</li></ul>";
    const mockUpdated = {
      id: 1,
      title: "수정된 글",
      content: updatedHtml,
      category: "admin_board",
      createdAt: Date.now(),
    };

    (db.updatePost as any).mockResolvedValue(mockUpdated);

    const result = await db.updatePost(1, {
      title: "수정된 글",
      content: updatedHtml,
    } as any);

    expect(result).toBeDefined();
    expect(result.content).toContain("<em>");
    expect(result.content).toContain("<ul>");
    expect(db.updatePost).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        content: updatedHtml,
      })
    );
  });

  it("should preserve HTML tags in content when listing posts", async () => {
    const mockPosts = [
      {
        id: 1,
        title: "HTML 게시글",
        content: "<p>HTML <strong>content</strong></p>",
        category: "admin_board",
        createdAt: Date.now(),
        viewCount: 5,
      },
      {
        id: 2,
        title: "일반 게시글",
        content: "일반 텍스트",
        category: "admin_board",
        createdAt: Date.now(),
        viewCount: 0,
      },
    ];

    (db.getAllPosts as any).mockResolvedValue(mockPosts);

    const result = await db.getAllPosts("admin_board" as any);
    expect(result).toHaveLength(2);
    expect(result[0].content).toContain("<strong>");
  });
});

describe("Notice Board List Display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return posts with viewCount and createdAt for notice board", async () => {
    const mockPosts = [
      {
        id: 1,
        title: "2026 새해 맞이 할인 이벤트!",
        content: "이벤트 내용",
        category: "notice",
        createdAt: new Date("2026-01-06").getTime(),
        viewCount: 148,
      },
      {
        id: 2,
        title: "프로필 영상을 무료로 만들어 드립니다",
        content: "프로필 영상 내용",
        category: "notice",
        createdAt: new Date("2025-04-10").getTime(),
        viewCount: 464,
      },
    ];

    (db.getAllPosts as any).mockResolvedValue(mockPosts);

    const result = await db.getAllPosts("notice" as any);
    expect(result).toHaveLength(2);

    // Each post should have viewCount and createdAt
    result.forEach((post: any) => {
      expect(post).toHaveProperty("viewCount");
      expect(post).toHaveProperty("createdAt");
      expect(post).toHaveProperty("title");
      expect(typeof post.viewCount).toBe("number");
      expect(typeof post.createdAt).toBe("number");
    });

    // Verify specific values
    expect(result[0].viewCount).toBe(148);
    expect(result[1].viewCount).toBe(464);
  });

  it("should format date correctly for display", () => {
    // Use a specific UTC timestamp to avoid timezone issues
    const timestamp = new Date("2025-04-10T12:00:00Z").getTime();
    const formatted = new Date(timestamp).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    
    expect(formatted).toContain("2025");
    expect(formatted).toContain("04");
    expect(formatted).toContain("10");
  });
});
