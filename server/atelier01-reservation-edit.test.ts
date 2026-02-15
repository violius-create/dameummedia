import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Atelier01 category tests ----
describe('Atelier01 게시판 카테고리', () => {
  it('posts 스키마에 atelier01 카테고리가 포함되어 있어야 한다', async () => {
    const { posts } = await import('../drizzle/schema');
    // Check the column definition includes atelier01
    const categoryCol = (posts as any).category;
    expect(categoryCol).toBeDefined();
    // The enum values should include 'atelier01'
    const enumValues = categoryCol.enumValues;
    expect(enumValues).toContain('atelier01');
  });

  it('posts 스키마에 기존 카테고리들도 유지되어야 한다', async () => {
    const { posts } = await import('../drizzle/schema');
    const enumValues = (posts as any).category.enumValues;
    expect(enumValues).toContain('notice');
    expect(enumValues).toContain('portfolio');
    expect(enumValues).toContain('review');
    expect(enumValues).toContain('concert');
    expect(enumValues).toContain('film');
    expect(enumValues).toContain('admin_board');
    expect(enumValues).toContain('atelier01');
  });
});

// ---- Reservation userId field tests ----
describe('예약 userId 필드', () => {
  it('reservations 스키마에 userId 필드가 존재해야 한다', async () => {
    const { reservations } = await import('../drizzle/schema');
    const userIdCol = (reservations as any).userId;
    expect(userIdCol).toBeDefined();
    expect(userIdCol.name).toBe('userId');
  });

  it('userId 필드는 nullable이어야 한다 (비로그인 사용자도 예약 가능)', async () => {
    const { reservations } = await import('../drizzle/schema');
    const userIdCol = (reservations as any).userId;
    // int columns without .notNull() should be nullable
    expect(userIdCol.notNull).toBeFalsy();
  });
});

// ---- Reservation create with userId tests ----
describe('예약 생성 시 userId 전달', () => {
  it('서버 라우터의 create 뮤테이션이 ctx.user?.id를 사용해야 한다', async () => {
    // Read the routers.ts source to verify userId is passed
    const fs = await import('fs');
    const routerSource = fs.readFileSync('./server/routers.ts', 'utf-8');
    
    // Check that the create mutation uses ctx and passes userId
    expect(routerSource).toContain('ctx.user?.id');
    expect(routerSource).toContain('userId: ctx.user?.id');
  });
});

// ---- Reservation edit button visibility tests ----
describe('예약 수정 버튼 표시 조건', () => {
  it('ReservationDetail에서 userId 기반 수정 권한 체크가 있어야 한다', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('./client/src/pages/ReservationDetail.tsx', 'utf-8');
    
    // Should check if user.id matches reservation.userId
    expect(source).toContain('reservation?.userId');
    expect(source).toContain('user.id === reservation.userId');
  });

  it('삭제 버튼은 관리자에게만 표시되어야 한다', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('./client/src/pages/ReservationDetail.tsx', 'utf-8');
    
    // Delete button should be wrapped in isAdmin check
    expect(source).toContain('{isAdmin && (');
    // The destructive delete button should be inside admin-only block
    expect(source).toMatch(/isAdmin.*variant="destructive"/s);
  });
});

// ---- Navigation tests ----
describe('네비게이션 DIY Atelier 링크', () => {
  it('App.tsx에 /atelier01 라우트가 등록되어 있어야 한다', async () => {
    const fs = await import('fs');
    const appSource = fs.readFileSync('./client/src/App.tsx', 'utf-8');
    
    expect(appSource).toContain('/atelier01');
    expect(appSource).toContain('Atelier01');
  });

  it('네비게이션에 DIY Atelier 링크가 있어야 한다', async () => {
    const fs = await import('fs');
    const appSource = fs.readFileSync('./client/src/App.tsx', 'utf-8');
    
    expect(appSource).toContain('DIY Atelier');
    expect(appSource).toContain('href="/atelier01"');
  });

  it('관리자 대시보드 탭이 관리자게시판으로 표시되어야 한다', async () => {
    const fs = await import('fs');
    const dashSource = fs.readFileSync('./client/src/pages/AdminDashboard.tsx', 'utf-8');
    
    expect(dashSource).toContain('관리자게시판');
    // Should NOT have Atelier01 as the admin board tab name
    expect(dashSource).not.toMatch(/value="admin-board".*>Atelier01</);
  });
});
