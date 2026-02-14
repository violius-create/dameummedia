import { describe, it, expect, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'admin-user',
    email: 'admin@example.com',
    name: 'Admin User',
    loginMethod: 'manus',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext['res'],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: 'regular-user',
    email: 'user@example.com',
    name: 'Regular User',
    loginMethod: 'manus',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext['res'],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext['res'],
  };
}

describe('UI Improvements Tests', () => {
  describe('Reservation status labels', () => {
    it('should return reservations with valid status values', async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const reservations = await caller.reservations.list({ limit: 5, offset: 0 });

      const validStatuses = [
        'pending', 'confirmed', 'payment_completed', 'work_pending',
        'in_progress', 'editing', 'completed', 'cancelled',
      ];

      for (const reservation of reservations) {
        expect(validStatuses).toContain(reservation.status);
      }
    });
  });

  describe('Reservation financial fields - admin access', () => {
    it('admin should be able to update quotedAmount and paidAmount', async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const reservations = await caller.reservations.list({ limit: 1, offset: 0 });

      if (reservations.length > 0) {
        const reservation = reservations[0];
        const updated = await caller.reservations.update({
          id: reservation.id,
          data: {
            quotedAmount: 500000,
            paidAmount: 300000,
          },
        });
        expect(updated).toBeDefined();
      }
    });
  });

  describe('Footer social media settings', () => {
    it('should include youtubeUrl and instagramUrl in footer settings', async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const settings = await caller.footerSettings.get();

      if (settings) {
        expect(settings).toHaveProperty('youtubeUrl');
        expect(settings).toHaveProperty('instagramUrl');
      }
    });

    it('admin should be able to update social media URLs', async () => {
      const caller = appRouter.createCaller(createAdminContext());

      const result = await caller.footerSettings.update({
        youtubeUrl: 'https://www.youtube.com/@dameum_media',
        instagramUrl: 'https://www.instagram.com/dameum_media',
      });

      expect(result).toBeDefined();
    });
  });

  describe('Section titles for reservation and notice', () => {
    it('should return section title data for reservation', async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const section = await caller.sectionTitles.get({ sectionKey: 'reservation' });

      if (section) {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('sectionKey', 'reservation');
      }
    });

    it('should return section title data for notice', async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const section = await caller.sectionTitles.get({ sectionKey: 'notice' });

      if (section) {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('sectionKey', 'notice');
      }
    });
  });
});
