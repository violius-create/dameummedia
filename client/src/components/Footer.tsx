import { trpc } from "@/lib/trpc";

export default function Footer() {
  const { data: footerSettings } = trpc.footerSettings.get.useQuery();

  if (!footerSettings) return null;

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{footerSettings.companyName}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {footerSettings.address && (
                <p className="flex items-start gap-2">
                  <span className="font-medium">주소:</span>
                  <span>{footerSettings.address}</span>
                </p>
              )}
              {footerSettings.businessNumber && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">사업자등록번호:</span>
                  <span>{footerSettings.businessNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">연락처</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {footerSettings.phone && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">전화:</span>
                  <a href={`tel:${footerSettings.phone}`} className="hover:text-primary">
                    {footerSettings.phone}
                  </a>
                </p>
              )}
              {footerSettings.email && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">이메일:</span>
                  <a href={`mailto:${footerSettings.email}`} className="hover:text-primary">
                    {footerSettings.email}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* 빈 공간 (필요시 추가 정보) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">소셜 미디어</h3>
            <div className="flex gap-4">
              {/* 소셜 미디어 링크는 siteBranding에서 가져올 수 있음 */}
            </div>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {footerSettings.companyName}. {footerSettings.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
