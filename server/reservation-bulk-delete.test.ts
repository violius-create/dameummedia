import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Reservation Bulk Delete', () => {
  const testReservationIds: number[] = [];

  it('should create multiple test reservations', async () => {
    for (let i = 0; i < 3; i++) {
      const reservation = await db.createReservation({
        eventName: `Bulk Delete Test ${i}`,
        clientName: `Test Client ${i}`,
        clientEmail: `test${i}@test.com`,
        clientPhone: '010-0000-0000',
        eventDate: new Date(),
        eventType: 'photo',
        venue: 'Test Venue',
        status: 'pending',
        progressStatus: '접수중',
      } as any);
      testReservationIds.push(reservation.id);
    }
    expect(testReservationIds.length).toBe(3);
    expect(testReservationIds.every(id => id > 0)).toBe(true);
  });

  it('should verify all test reservations exist', async () => {
    for (const id of testReservationIds) {
      const reservation = await db.getReservationById(id);
      expect(reservation).toBeDefined();
      expect(reservation?.eventName).toContain('Bulk Delete Test');
    }
  });

  it('should bulk delete multiple reservations at once', async () => {
    await db.deleteReservationsBulk(testReservationIds);
    
    // Verify all are deleted
    for (const id of testReservationIds) {
      const reservation = await db.getReservationById(id);
      expect(reservation == null).toBe(true);
    }
  });

  it('should handle non-existent IDs without error', async () => {
    // Deleting non-existent IDs should not throw
    await db.deleteReservationsBulk([999999, 999998, 999997]);
    expect(true).toBe(true);
  });
});
