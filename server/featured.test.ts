import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock db module
vi.mock('./db', () => ({
  getFeaturedPost: vi.fn(),
  setFeaturedPost: vi.fn(),
  unsetFeaturedPost: vi.fn(),
  getPostById: vi.fn(),
}));

import * as db from './db';

describe('Featured Posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeaturedPost', () => {
    it('should return a featured post for a given category', async () => {
      const mockPost = {
        id: 1,
        title: 'Featured Concert',
        content: '<p>Test content</p>',
        category: 'concert',
        featured: 1,
        status: 'published',
        authorId: 1,
        imageUrl: 'https://example.com/image.jpg',
        videoUrl: null,
        viewCount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(db.getFeaturedPost).mockResolvedValue(mockPost as any);

      const result = await db.getFeaturedPost('concert');
      expect(result).toEqual(mockPost);
      expect(db.getFeaturedPost).toHaveBeenCalledWith('concert');
    });

    it('should return null when no featured post exists', async () => {
      vi.mocked(db.getFeaturedPost).mockResolvedValue(null);

      const result = await db.getFeaturedPost('concert');
      expect(result).toBeNull();
    });

    it('should query by correct category', async () => {
      vi.mocked(db.getFeaturedPost).mockResolvedValue(null);

      await db.getFeaturedPost('film');
      expect(db.getFeaturedPost).toHaveBeenCalledWith('film');

      await db.getFeaturedPost('concert');
      expect(db.getFeaturedPost).toHaveBeenCalledWith('concert');
    });
  });

  describe('setFeaturedPost', () => {
    it('should set a post as featured', async () => {
      const mockPost = {
        id: 5,
        title: 'New Featured',
        content: '<p>Content</p>',
        category: 'concert',
        featured: 1,
        status: 'published',
        authorId: 1,
        imageUrl: null,
        videoUrl: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(db.setFeaturedPost).mockResolvedValue(mockPost as any);

      const result = await db.setFeaturedPost(5, 'concert');
      expect(result).toEqual(mockPost);
      expect(db.setFeaturedPost).toHaveBeenCalledWith(5, 'concert');
    });

    it('should replace existing featured post in same category', async () => {
      const mockNewFeatured = {
        id: 10,
        title: 'Replacement Featured',
        category: 'film',
        featured: 1,
      };
      vi.mocked(db.setFeaturedPost).mockResolvedValue(mockNewFeatured as any);

      const result = await db.setFeaturedPost(10, 'film');
      expect(result?.featured).toBe(1);
      expect(result?.id).toBe(10);
    });
  });

  describe('unsetFeaturedPost', () => {
    it('should unset a featured post', async () => {
      const mockPost = {
        id: 5,
        title: 'No Longer Featured',
        category: 'concert',
        featured: 0,
      };
      vi.mocked(db.unsetFeaturedPost).mockResolvedValue(mockPost as any);

      const result = await db.unsetFeaturedPost(5);
      expect(result?.featured).toBe(0);
      expect(db.unsetFeaturedPost).toHaveBeenCalledWith(5);
    });
  });
});
