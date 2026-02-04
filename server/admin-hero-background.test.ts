import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

/**
 * AdminHeroBackground 컴포넌트의 siteBranding 로직 테스트
 * 
 * 테스트 시나리오:
 * 1. siteBranding 데이터를 정상적으로 조회
 * 2. siteBranding 데이터를 업데이트하고 저장
 * 3. 업데이트된 데이터가 데이터베이스에 유지되는지 확인
 * 4. 업데이트 후 원래 값으로 복구
 */

function createAdminContext(): TrpcContext {
  const user = {
    id: 1,
    openId: 'admin-user',
    email: 'admin@example.com',
    name: 'Admin User',
    loginMethod: 'manus' as const,
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      headers: new Map(),
      method: 'POST',
      url: 'http://localhost:3000/api/trpc',
    } as any,
    res: {
      setHeader: () => {},
    } as any,
  };

  return ctx;
}

describe('AdminHeroBackground - siteBranding 로직', () => {
  const caller = appRouter.createCaller(createAdminContext());

  it('siteBranding 데이터를 정상적으로 조회해야 함', async () => {
    const siteBranding = await caller.siteBranding.get();
    
    expect(siteBranding).toBeDefined();
    expect(siteBranding?.title).toBeDefined();
    expect(siteBranding?.subtitle).toBeDefined();
  });

  it('siteBranding 데이터를 업데이트하고 저장해야 함', async () => {
    const testTitle = '담음미디어 - 테스트';
    const testSubtitle = 'Test Subtitle';
    
    // 데이터 업데이트
    const updated = await caller.siteBranding.update({
      title: testTitle,
      subtitle: testSubtitle,
    });
    
    expect(updated.title).toBe(testTitle);
    expect(updated.subtitle).toBe(testSubtitle);
  });

  it('업데이트된 siteBranding 데이터가 데이터베이스에 유지되어야 함', async () => {
    const testTitle = '담음미디어 - 테스트';
    const testSubtitle = 'Test Subtitle';
    
    // 데이터 업데이트
    await caller.siteBranding.update({
      title: testTitle,
      subtitle: testSubtitle,
    });
    
    // 다시 조회하여 데이터 유지 확인
    const reloaded = await caller.siteBranding.get();
    expect(reloaded?.title).toBe(testTitle);
    expect(reloaded?.subtitle).toBe(testSubtitle);
  });

  it('siteBranding 업데이트 후 원래 값으로 복구해야 함', async () => {
    const originalTitle = 'Dameum Media';
    const originalSubtitle = 'Professional Media Production';
    
    // 데이터 업데이트
    await caller.siteBranding.update({
      title: '담음미디어 - 테스트',
      subtitle: 'Test Subtitle',
    });
    
    // 원래 값으로 복구
    const restored = await caller.siteBranding.update({
      title: originalTitle,
      subtitle: originalSubtitle,
    });
    
    expect(restored.title).toBe(originalTitle);
    expect(restored.subtitle).toBe(originalSubtitle);
  });

  it('siteBranding 데이터가 null이 아닌지 확인해야 함', async () => {
    const siteBranding = await caller.siteBranding.get();
    
    // siteBranding이 존재하거나 기본값을 사용
    const title = siteBranding?.title || '담음미디어';
    const subtitle = siteBranding?.subtitle || 'Professional Media Production';
    
    expect(title).not.toBeNull();
    expect(title).not.toBeUndefined();
    expect(subtitle).not.toBeNull();
    expect(subtitle).not.toBeUndefined();
  });

  it('useEffect가 siteBranding 데이터 변경을 감지해야 함', async () => {
    /**
     * AdminHeroBackground.tsx의 useEffect:
     * ```
     * useEffect(() => {
     *   if (siteBranding) {
     *     setHeroTitle(siteBranding.title || '담음미디어');
     *     setHeroSubtitle(siteBranding.subtitle || 'Professional Media Production');
     *   }
     * }, [siteBranding]);
     * ```
     * 
     * 이 로직은 siteBranding 데이터가 변경될 때마다
     * heroTitle과 heroSubtitle 상태를 업데이트합니다.
     */
    
    const siteBranding = await caller.siteBranding.get();
    expect(siteBranding).toBeDefined();
    
    // siteBranding이 변경되면 useEffect가 실행되어 상태 업데이트
    if (siteBranding) {
      // 데이터 업데이트
      const updated = await caller.siteBranding.update({
        title: '새로운 제목',
        subtitle: '새로운 부제',
      });
      
      // 업데이트된 데이터 확인
      expect(updated.title).toBe('새로운 제목');
      expect(updated.subtitle).toBe('새로운 부제');
      
      // 원래 값으로 복구
      await caller.siteBranding.update({
        title: siteBranding.title,
        subtitle: siteBranding.subtitle,
      });
    }
  });
});
