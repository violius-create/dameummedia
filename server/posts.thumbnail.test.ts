import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { posts } from '../drizzle/schema';

describe('Posts Thumbnail and Link Functionality', () => {
  let testPostId: number;
  const testPost = {
    title: '테스트 공연 영상',
    content: '이것은 테스트 게시물입니다.',
    category: 'concert' as const,
    authorId: 1,
    imageUrl: 'https://example.com/test-image.jpg',
    videoUrl: 'https://example.com/test-video.mp4',
    status: 'published' as const,
  };

  beforeAll(async () => {
    // Create a test post
    const created = await db.createPost(testPost);
    testPostId = created.id;
  });

  afterAll(async () => {
    // Clean up - delete test post
    if (testPostId) {
      await db.deletePost(testPostId);
    }
  });

  it('should create a post with imageUrl', async () => {
    const post = await db.getPostById(testPostId);
    expect(post).toBeDefined();
    expect(post?.title).toBe(testPost.title);
    expect(post?.imageUrl).toBe(testPost.imageUrl);
    expect(post?.category).toBe('concert');
  });

  it('should retrieve posts by category', async () => {
    const concertPosts = await db.getPosts('concert', 10, 0);
    expect(Array.isArray(concertPosts)).toBe(true);
    expect(concertPosts.length).toBeGreaterThan(0);
    
    // Check if our test post is in the results
    const found = concertPosts.find(p => p.id === testPostId);
    expect(found).toBeDefined();
    expect(found?.imageUrl).toBe(testPost.imageUrl);
  });

  it('should have imageUrl field populated for thumbnail display', async () => {
    const post = await db.getPostById(testPostId);
    expect(post?.imageUrl).toBeTruthy();
    expect(post?.imageUrl).toMatch(/^https?:\/\//);
  });

  it('should support filtering by multiple categories', async () => {
    // Create a film post
    const filmPost = await db.createPost({
      ...testPost,
      title: '테스트 영상 제작',
      category: 'film' as const,
    });

    const filmPosts = await db.getPosts('film', 10, 0);
    expect(filmPosts.length).toBeGreaterThan(0);
    expect(filmPosts.some(p => p.id === filmPost.id)).toBe(true);

    // Clean up
    await db.deletePost(filmPost.id);
  });

  it('should return posts with all required fields for rendering', async () => {
    const post = await db.getPostById(testPostId);
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('content');
    expect(post).toHaveProperty('category');
    expect(post).toHaveProperty('imageUrl');
    expect(post).toHaveProperty('createdAt');
    expect(post).toHaveProperty('status');
  });

  it('should handle posts without imageUrl gracefully', async () => {
    const postWithoutImage = await db.createPost({
      title: '이미지 없는 게시물',
      content: '이 게시물은 이미지가 없습니다.',
      category: 'notice' as const,
      authorId: 1,
      status: 'published' as const,
    });

    const retrieved = await db.getPostById(postWithoutImage.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.imageUrl).toBeNull();

    // Clean up
    await db.deletePost(postWithoutImage.id);
  });

  it('should return published posts only for public queries', async () => {
    const draftPost = await db.createPost({
      title: '드래프트 게시물',
      content: '이 게시물은 드래프트입니다.',
      category: 'concert' as const,
      authorId: 1,
      status: 'draft' as const,
    });

    const publishedPosts = await db.getPosts('concert', 10, 0);
    const foundDraft = publishedPosts.find(p => p.id === draftPost.id);
    expect(foundDraft).toBeUndefined();

    // Clean up
    await db.deletePost(draftPost.id);
  });
});
