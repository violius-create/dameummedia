import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { InsertServiceItem } from '../drizzle/schema';

describe('Service Items', () => {
  const testItem: InsertServiceItem = {
    itemKey: 'test_item',
    title: 'Test Service Item',
    description: 'Test description',
    type: 'image',
    mediaUrl: 'https://example.com/test.jpg',
    fileKey: 'test/test-file.jpg',
    uploadedBy: 1,
    status: 'published',
    thumbnailUrl: undefined,
  };

  let createdItemId: number;

  beforeAll(async () => {
    // Setup: Create a test item
    const result = await db.createServiceItem(testItem);
    if (result && typeof result === 'object' && 'insertId' in result) {
      createdItemId = result.insertId as number;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete the test item
    if (createdItemId) {
      await db.deleteServiceItem(createdItemId);
    }
  });

  it('should create a service item', async () => {
    const result = await db.createServiceItem(testItem);
    expect(result).toBeDefined();
  });

  it('should get service items', async () => {
    const items = await db.getServiceItems(10, 0);
    expect(Array.isArray(items)).toBe(true);
  });

  it('should get service item by id', async () => {
    if (!createdItemId) return;
    const item = await db.getServiceItemById(createdItemId);
    expect(item).toBeDefined();
    expect(item?.title).toBe(testItem.title);
  });

  it('should update service item', async () => {
    if (!createdItemId) return;
    const updatedDescription = 'Updated description';
    await db.updateServiceItem(createdItemId, {
      description: updatedDescription,
    });
    const item = await db.getServiceItemById(createdItemId);
    expect(item?.description).toBe(updatedDescription);
  });

  it('should delete service item', async () => {
    if (!createdItemId) return;
    await db.deleteServiceItem(createdItemId);
    const item = await db.getServiceItemById(createdItemId);
    expect(item).toBeNull();
  });
});
