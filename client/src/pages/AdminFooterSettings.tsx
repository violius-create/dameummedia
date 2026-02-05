import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminFooterSettings() {
  const { user, isAuthenticated } = useAuth();
  const { data: footerSettings, refetch } = trpc.footerSettings.get.useQuery();
  
  const [companyName, setCompanyName] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");

  useEffect(() => {
    if (footerSettings) {
      setCompanyName(footerSettings.companyName || "");
      setCopyrightText(footerSettings.copyrightText || "");
      setAddress(footerSettings.address || "");
      setPhone(footerSettings.phone || "");
      setEmail(footerSettings.email || "");
      setBusinessNumber(footerSettings.businessNumber || "");
    }
  }, [footerSettings]);

  const updateMutation = trpc.footerSettings.update.useMutation({
    onSuccess: () => {
      toast.success("Footer 설정이 저장되었습니다.");
      refetch();
    },
    onError: (error) => {
      toast.error(`저장 실패: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      companyName,
      copyrightText,
      address,
      phone,
      email,
      businessNumber,
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>관리자만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Footer 설정</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            돌아가기
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Footer 정보 관리</CardTitle>
            <CardDescription>
              웹사이트 하단에 표시될 정보를 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">회사명</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="담음미디어"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copyrightText">저작권 문구</Label>
              <Input
                id="copyrightText"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                placeholder="All rights reserved."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="서울특별시 강남구..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02-1234-5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@dameum.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessNumber">사업자등록번호</Label>
              <Input
                id="businessNumber"
                value={businessNumber}
                onChange={(e) => setBusinessNumber(e.target.value)}
                placeholder="123-45-67890"
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
