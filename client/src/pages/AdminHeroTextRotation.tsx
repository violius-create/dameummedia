import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowLeft, Save, RotateCcw, Type } from "lucide-react";

export default function AdminHeroTextRotation() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [text1Title, setText1Title] = useState("Professional Media Production");
  const [text1Description, setText1Description] = useState("Record, Mixing, Mastering and Videos");
  const [text2Title, setText2Title] = useState("");
  const [text2Description, setText2Description] = useState("");
  const [text3Title, setText3Title] = useState("");
  const [text3Description, setText3Description] = useState("");
  const [intervalMs, setIntervalMs] = useState(2000);

  const { data: heroTextData, isLoading } = trpc.heroTextRotation.get.useQuery();
  const updateMutation = trpc.heroTextRotation.update.useMutation({
    onSuccess: () => {
      toast.success("히어로 텍스트 설정이 저장되었습니다.");
    },
    onError: (error) => {
      toast.error("저장 실패: " + error.message);
    },
  });

  useEffect(() => {
    if (heroTextData) {
      setText1Title(heroTextData.text1Title || "");
      setText1Description(heroTextData.text1Description || "");
      setText2Title(heroTextData.text2Title || "");
      setText2Description(heroTextData.text2Description || "");
      setText3Title(heroTextData.text3Title || "");
      setText3Description(heroTextData.text3Description || "");
      setIntervalMs(heroTextData.intervalMs || 2000);
    }
  }, [heroTextData]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">관리자 권한이 필요합니다.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({
      text1Title,
      text1Description,
      text2Title,
      text2Description,
      text3Title,
      text3Description,
      intervalMs,
    });
  };

  // Preview: cycle through active texts
  const activeTexts = [
    { title: text1Title, description: text1Description },
    { title: text2Title, description: text2Description },
    { title: text3Title, description: text3Description },
  ].filter(t => t.title.trim() !== "");

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          관리자 대시보드
        </Button>
        <div>
          <h1 className="text-2xl font-bold">히어로 텍스트 로테이션 설정</h1>
          <p className="text-sm text-muted-foreground">메인 화면 섹션1에 표시되는 텍스트를 최대 3개까지 설정하고 자동 전환 시간을 조절합니다.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Interval Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              전환 시간 설정
            </CardTitle>
            <CardDescription>텍스트가 자동으로 전환되는 간격을 밀리초(ms) 단위로 설정합니다. (500ms ~ 30,000ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="intervalMs">전환 간격 (ms)</Label>
                <Input
                  id="intervalMs"
                  type="number"
                  min={500}
                  max={30000}
                  step={100}
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}
                />
              </div>
              <div className="text-sm text-muted-foreground pt-6">
                = {(intervalMs / 1000).toFixed(1)}초
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Text 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              텍스트 1
            </CardTitle>
            <CardDescription>첫 번째로 표시되는 텍스트입니다. (필수)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text1Title">제목</Label>
              <Input
                id="text1Title"
                value={text1Title}
                onChange={(e) => setText1Title(e.target.value)}
                placeholder="예: Professional Media Production"
              />
            </div>
            <div>
              <Label htmlFor="text1Description">설명</Label>
              <Input
                id="text1Description"
                value={text1Description}
                onChange={(e) => setText1Description(e.target.value)}
                placeholder="예: Record, Mixing, Mastering and Videos"
              />
            </div>
          </CardContent>
        </Card>

        {/* Text 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              텍스트 2
            </CardTitle>
            <CardDescription>두 번째로 표시되는 텍스트입니다. 비워두면 로테이션에서 제외됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text2Title">제목</Label>
              <Input
                id="text2Title"
                value={text2Title}
                onChange={(e) => setText2Title(e.target.value)}
                placeholder="예: Concert Live Recording"
              />
            </div>
            <div>
              <Label htmlFor="text2Description">설명</Label>
              <Input
                id="text2Description"
                value={text2Description}
                onChange={(e) => setText2Description(e.target.value)}
                placeholder="예: 최고의 공연 실황을 담습니다"
              />
            </div>
          </CardContent>
        </Card>

        {/* Text 3 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              텍스트 3
            </CardTitle>
            <CardDescription>세 번째로 표시되는 텍스트입니다. 비워두면 로테이션에서 제외됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text3Title">제목</Label>
              <Input
                id="text3Title"
                value={text3Title}
                onChange={(e) => setText3Title(e.target.value)}
                placeholder="예: Making Film Production"
              />
            </div>
            <div>
              <Label htmlFor="text3Description">설명</Label>
              <Input
                id="text3Description"
                value={text3Description}
                onChange={(e) => setText3Description(e.target.value)}
                placeholder="예: 비하인드 스토리를 영상으로"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {activeTexts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
              <CardDescription>설정된 텍스트 {activeTexts.length}개가 {(intervalMs / 1000).toFixed(1)}초 간격으로 전환됩니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-8 text-white space-y-4">
                {activeTexts.map((text, index) => (
                  <div key={index} className="border-l-2 border-blue-400 pl-4 py-2">
                    <p className="text-xs text-blue-400 mb-1">텍스트 {index + 1}</p>
                    <h3 className="text-xl font-bold">{text.title}</h3>
                    {text.description && (
                      <p className="text-sm text-gray-300 mt-1">{text.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "저장 중..." : "설정 저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
