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
  const [sections, setSections] = useState<Record<string, { title: string; description: string; thumbnailGap: number; thumbnailWidth: number }>>({});
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
      const sectionMap: Record<string, { title: string; description: string; thumbnailGap: number; thumbnailWidth: number }> = {};
      allSections.forEach(section => {
        sectionMap[section.sectionKey] = {
          title: section.title,
          description: section.description || '',
          thumbnailGap: section.thumbnailGap || 24,
          thumbnailWidth: section.thumbnailWidth || 280,
        };
      });
      setSections(sectionMap);
      setIsLoading(false);
    }
  }, [allSections]);

  const handleSectionUpdate = (sectionKey: string, field: 'title' | 'description' | 'thumbnailGap' | 'thumbnailWidth', value: string | number) => {
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
      thumbnailGap: section.thumbnailGap,
      thumbnailWidth: section.thumbnailWidth,
    });
  };

  const sectionKeys = ['hero_section', 'concert_live', 'making_film', 'notice', 'information', 'price', 'reservation'];
  const sectionLabels: Record<string, string> = {
    'hero_section': '섹션 1 (메인)',
    'concert_live': '공연 영상',
    'making_film': '영상 제작',
    'notice': '공지사항',
    'information': 'Information',
    'price': 'Price',
    'reservation': 'Reservation',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">섹션 제목 관리</h1>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
          </Link>
        </div>
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
                  {(key === 'concert_live' || key === 'making_film') && (
                    <>
                      <div>
                        <Label htmlFor={`${key}-gap`}>썸네일 간격 (px): {sections[key]?.thumbnailGap || 24}px</Label>
                        <input
                          type="range"
                          id={`${key}-gap`}
                          min="0"
                          max="48"
                          step="2"
                          value={sections[key]?.thumbnailGap || 24}
                          onChange={(e) => handleSectionUpdate(key, 'thumbnailGap', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0px</span>
                          <span>24px</span>
                          <span>48px</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`${key}-width`}>썸네일 크기 (px): {sections[key]?.thumbnailWidth || 280}px</Label>
                        <input
                          type="range"
                          id={`${key}-width`}
                          min="200"
                          max="400"
                          step="10"
                          value={sections[key]?.thumbnailWidth || 280}
                          onChange={(e) => handleSectionUpdate(key, 'thumbnailWidth', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>200px</span>
                          <span>300px</span>
                          <span>400px</span>
                        </div>
                      </div>
                    </>
                  )}
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
