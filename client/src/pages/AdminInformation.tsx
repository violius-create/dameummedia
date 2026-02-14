import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { Link } from "wouter";

const sectionConfigs = [
  { key: "about", label: "소개 (About)", description: "상단 소개 섹션의 제목, 설명, 슬로건을 관리합니다." },
  { key: "experiences", label: "주요 경력", description: "주요 경력 항목을 관리합니다." },
  { key: "achievements", label: "주요 실적", description: "주요 실적 항목을 관리합니다." },
  { key: "dramaWorks", label: "드라마 및 음반 작업", description: "드라마/음반 작업 태그를 관리합니다." },
];

const defaultItems: Record<string, { title: string; description: string; items: string[] }> = {
  about: {
    title: "담음미디어는",
    description: "다년간 실제 연주 생활과 지휘자 경험을 한 운영자가 직접 녹음-촬영 및 편집을 합니다.",
    items: ["음악이 보이는 영상을 만듭니다", "열정의 가치를 담는, 담음미디어"],
  },
  experiences: {
    title: "주요 경력",
    description: "",
    items: [
      "전 대우전자(주) 중앙연구소 주임연구원",
      "중대 루바토 오케스트라 비올라 및 지휘자 역임(3회)",
      "베누스토 오케스트라 비올라 단원 및 부지휘자 역임",
      "체카 사중주단 비올라 단원",
      "구 테헤란밸리 오케스트라 초대 음악감독 역임",
      "사단법인 레일아트 공연자 및 매거진 팀장 역임",
    ],
  },
  achievements: {
    title: "주요 실적",
    description: "",
    items: [
      "400여개의 오케스트레이션 및 악보 제작 판매중",
      "영화음악 편곡, 녹음 및 자문 (정승필 실종사건, 노리개, 커피메이트)",
      "다수의 드라마 녹음용 악보 및 String 편곡 작업",
      "뮤지컬 음악 작곡 (알로하오에)",
      "세계 최초 온라인 콘서트 '아,대한민국!' 프로듀싱 및 음반제작 (2005)",
      "500여건의 녹음 및 촬영, 300여건의 음반 및 DVD 제작",
      "직장인 밴드에서 바이올린 및 베이스 주자로 활동",
    ],
  },
  dramaWorks: {
    title: "드라마 및 음반 작업",
    description: "다수의 드라마 녹음용 악보 및 String 편곡 작업을 진행했습니다.",
    items: [
      "신기생뎐", "매리는 외박중", "구미호여우누이뎐",
      "그겨울 바람이 분다", "굿닥터", "장근석 1집", "시아준수 솔로2집",
    ],
  },
};

interface SectionFormData {
  title: string;
  description: string;
  items: string[];
}

export default function AdminInformation() {
  const { user, isAuthenticated } = useAuth();
  const { data: infoItems, refetch } = trpc.informationItems.list.useQuery();
  const upsertMutation = trpc.informationItems.upsert.useMutation({
    onSuccess: () => {
      toast.success("저장되었습니다.");
      refetch();
    },
    onError: (error) => {
      toast.error(`저장 실패: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState<Record<string, SectionFormData>>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Initialize form data from DB or defaults
  useEffect(() => {
    const data: Record<string, SectionFormData> = {};
    for (const config of sectionConfigs) {
      const dbItem = infoItems?.find((item: any) => item.sectionKey === config.key);
      if (dbItem) {
        try {
          data[config.key] = {
            title: dbItem.title,
            description: dbItem.description || "",
            items: JSON.parse(dbItem.items),
          };
        } catch {
          data[config.key] = { ...defaultItems[config.key] };
        }
      } else {
        data[config.key] = { ...defaultItems[config.key] };
      }
    }
    setFormData(data);
  }, [infoItems]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">관리자 권한이 필요합니다.</p>
      </div>
    );
  }

  const handleSave = (sectionKey: string) => {
    const section = formData[sectionKey];
    if (!section) return;
    upsertMutation.mutate({
      sectionKey,
      title: section.title,
      items: JSON.stringify(section.items.filter(item => item.trim() !== "")),
      description: section.description || undefined,
    });
    setEditingSection(null);
  };

  const updateItem = (sectionKey: string, index: number, value: string) => {
    setFormData(prev => {
      const section = { ...prev[sectionKey] };
      const items = [...section.items];
      items[index] = value;
      return { ...prev, [sectionKey]: { ...section, items } };
    });
  };

  const addItem = (sectionKey: string) => {
    setFormData(prev => {
      const section = { ...prev[sectionKey] };
      return { ...prev, [sectionKey]: { ...section, items: [...section.items, ""] } };
    });
  };

  const removeItem = (sectionKey: string, index: number) => {
    setFormData(prev => {
      const section = { ...prev[sectionKey] };
      const items = section.items.filter((_, i) => i !== index);
      return { ...prev, [sectionKey]: { ...section, items } };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Information 관리</h1>
            <p className="text-muted-foreground mt-1">Information 페이지의 각 섹션 내용을 수정합니다.</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {sectionConfigs.map((config) => {
            const section = formData[config.key];
            if (!section) return null;
            const isEditing = editingSection === config.key;

            return (
              <Card key={config.key}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSection(config.key)}
                      >
                        수정
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>섹션 제목</Label>
                        <Input
                          value={section.title}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              [config.key]: { ...prev[config.key], title: e.target.value },
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>섹션 설명 (선택)</Label>
                        <Textarea
                          value={section.description}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              [config.key]: { ...prev[config.key], description: e.target.value },
                            }))
                          }
                          placeholder="섹션에 대한 설명을 입력하세요 (선택사항)"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>항목 목록</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addItem(config.key)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            항목 추가
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {section.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <Input
                                value={item}
                                onChange={(e) => updateItem(config.key, index, e.target.value)}
                                placeholder={`항목 ${index + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(config.key, index)}
                                className="flex-shrink-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleSave(config.key)}
                          disabled={upsertMutation.isPending}
                        >
                          {upsertMutation.isPending ? "저장 중..." : "저장"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingSection(null)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium text-sm text-muted-foreground">제목: {section.title}</p>
                      {section.description && (
                        <p className="text-sm text-muted-foreground">설명: {section.description}</p>
                      )}
                      <div className="mt-2">
                        {config.key === "dramaWorks" ? (
                          <div className="flex flex-wrap gap-2">
                            {section.items.map((item, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-muted rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-1">
                            {section.items.map((item, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
