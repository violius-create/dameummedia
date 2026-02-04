import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminSectionTitles() {
  const [sections, setSections] = useState<Record<string, { title: string; description: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { data: allSections } = trpc.sectionTitles.list.useQuery();
  const updateMutation = trpc.sectionTitles.update.useMutation({
    onSuccess: () => {
      toast.success("섹션 제목이 저장되었습니다.");
    },
    onError: (error) => {
      toast.error(`저장 실패: ${error.message}`);
    },
  });

  useEffect(() => {
    if (allSections) {
      const sectionMap: Record<string, { title: string; description: string }> = {};
      allSections.forEach(section => {
        sectionMap[section.sectionKey] = {
          title: section.title,
          description: section.description || '',
        };
      });
      setSections(sectionMap);
      setIsLoading(false);
    }
  }, [allSections]);

  const handleSectionUpdate = (sectionKey: string, field: 'title' | 'description', value: string) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const handleSave = (sectionKey: string) => {
    const section = sections[sectionKey];
    updateMutation.mutate({
      sectionKey,
      title: section.title,
      description: section.description,
    });
  };

  const sectionKeys = ['hero_section', 'concert_live', 'making_film', 'information', 'price', 'reservation'];
  const sectionLabels: Record<string, string> = {
    'hero_section': '섹션 1 (메인)',
    'concert_live': '공연 영상',
    'making_film': '영상 제작',
    'information': 'Information',
    'price': 'Price',
    'reservation': 'Reservation',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  관리자 메뉴
                </Button>
              </Link>
            </div>
            <h1 className="text-lg font-bold">섹션 제목 관리</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="container max-w-4xl py-8">
        {isLoading ? (
          <div className="text-center">로딩 중...</div>
        ) : (
          <div className="space-y-6">
            {sectionKeys.map(key => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{sectionLabels[key]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`${key}-title`}>제목</Label>
                    <Input
                      id={`${key}-title`}
                      placeholder="섹션 제목"
                      value={sections[key]?.title || ''}
                      onChange={(e) => handleSectionUpdate(key, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${key}-description`}>설명</Label>
                    <Textarea
                      id={`${key}-description`}
                      placeholder="섹션 설명 (선택사항)"
                      value={sections[key]?.description || ''}
                      onChange={(e) => handleSectionUpdate(key, 'description', e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={() => handleSave(key)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "저장 중..." : "저장"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
