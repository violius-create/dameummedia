import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("DIY Atelier 관리자 전용 설정", () => {
  it("App.tsx에서 DIY Atelier 링크가 관리자 조건으로 감싸져 있어야 함", () => {
    const appContent = readFileSync(
      resolve(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    
    // Desktop menu: DIY Atelier link should be wrapped in admin check
    const desktopPattern = /isAuthenticated && user\?\.role === ['"]admin['"].*\n.*atelier01/;
    expect(desktopPattern.test(appContent)).toBe(true);
    
    // Mobile menu: same admin check
    const mobilePattern = /isAuthenticated && user\?\.role === ['"]admin['"][\s\S]*?atelier01[\s\S]*?setMobileMenuOpen/;
    expect(mobilePattern.test(appContent)).toBe(true);
  });

  it("atelier01 라우트가 App.tsx에 등록되어 있어야 함", () => {
    const appContent = readFileSync(
      resolve(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    expect(appContent).toContain('path="/atelier01"');
    expect(appContent).toContain("Atelier01");
  });

  it("Atelier01.tsx 페이지에서 관리자 인증 체크가 있어야 함", () => {
    const atelierContent = readFileSync(
      resolve(__dirname, "../client/src/pages/Atelier01.tsx"),
      "utf-8"
    );
    
    // 관리자 인증 체크 패턴이 있어야 함
    expect(atelierContent).toContain("isAdmin");
    expect(atelierContent).toContain("접근 권한이 없습니다");
    expect(atelierContent).toContain("관리자만 접근");
  });
});

describe("게시물 이미지 태그 교체", () => {
  it("posts 테이블의 category에 atelier01이 포함되어야 함", () => {
    const schemaContent = readFileSync(
      resolve(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    expect(schemaContent).toContain("atelier01");
  });
});

describe("예약 상세 이메일 필드 제거", () => {
  it("ReservationDetail.tsx에서 이메일 편집 필드가 제거되어야 함", () => {
    const detailContent = readFileSync(
      resolve(__dirname, "../client/src/pages/ReservationDetail.tsx"),
      "utf-8"
    );
    
    // 이메일 편집 Input이 없어야 함
    expect(detailContent).not.toContain('type="email"');
    // 이메일 표시 InfoRow도 없어야 함
    expect(detailContent).not.toContain('displayData.clientEmail');
  });
});

describe("예약 수정 버튼 항상 표시", () => {
  it("ReservationDetail.tsx에서 수정 버튼이 조건 없이 항상 표시되어야 함", () => {
    const detailContent = readFileSync(
      resolve(__dirname, "../client/src/pages/ReservationDetail.tsx"),
      "utf-8"
    );
    
    // 수정 버튼이 존재해야 함
    expect(detailContent).toContain("handleEdit");
    expect(detailContent).toContain("수정");
    
    // 수정 버튼이 isAdmin/isOwner 조건 없이 렌더링되는지 확인
    expect(detailContent).toMatch(/\{!isEditing \?/);
    
    // 이전 조건 패턴이 없어야 함
    expect(detailContent).not.toContain("isAdmin || (user && reservation?.userId && user.id === reservation.userId)");
  });

  it("삭제 버튼은 관리자만 볼 수 있어야 함", () => {
    const detailContent = readFileSync(
      resolve(__dirname, "../client/src/pages/ReservationDetail.tsx"),
      "utf-8"
    );
    
    // 삭제 버튼은 isAdmin 조건으로 감싸져 있어야 함
    expect(detailContent).toMatch(/isAdmin.*handleDelete/s);
    expect(detailContent).toContain("삭제");
  });

  it("reservations 테이블에 userId 필드가 있어야 함", () => {
    const schemaContent = readFileSync(
      resolve(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    // reservations 테이블에 userId 필드 확인
    expect(schemaContent).toMatch(/userId.*int/);
  });
});
