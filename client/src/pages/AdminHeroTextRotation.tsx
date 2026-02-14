import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowLeft, Save, RotateCcw, Type, Sparkles } from "lucide-react";

const ANIMATION_TYPES = [
  {
    value: "fadeSlideUp",
    label: "페이드 슬라이드 업",
    description: "아래에서 위로 슬라이드하며 페이드 인",
    preview: "↑ Fade + Slide Up",
  },
  {
    value: "fadeScale",
    label: "페이드 스케일",
    description: "작아지면서 사라지고 커지면서 나타남",
    preview: "⊕ Fade + Scale",
  },
  {
    value: "slideLeft",
    label: "슬라이드 레프트",
    description: "왼쪽에서 오른쪽으로 슬라이드하며 등장",
    preview: "← Slide Left",
  },
  {
    value: "typewriter",
    label: "타이프라이터",
    description: "글자가 하나씩 타이핑되는 효과",
    preview: "⌨ Typewriter",
  },
  {
    value: "flipDown",
    label: "플립 다운",
    description: "위에서 뒤집어지며 등장하는 3D 효과",
    preview: "↻ Flip Down",
  },
  {
    value: "glitch",
    label: "글리치",
    description: "디지털 글리치 효과로 등장",
    preview: "⚡ Glitch",
  },
];

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
  const [animationType, setAnimationType] = useState("fadeSlideUp");

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
      setAnimationType((heroTextData as any).animationType || "fadeSlideUp");
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
      animationType,
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

        {/* Animation Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              텍스트 전환 애니메이션
            </CardTitle>
            <CardDescription>텍스트가 전환될 때 사용할 애니메이션 효과를 선택합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ANIMATION_TYPES.map((anim) => (
                <button
                  key={anim.value}
                  type="button"
                  onClick={() => setAnimationType(anim.value)}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    animationType === anim.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <div className="text-lg mb-1 font-mono">{anim.preview}</div>
                  <div className="font-semibold text-sm">{anim.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{anim.description}</div>
                  {animationType === anim.value && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
                  )}
                </button>
              ))}
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
              <CardDescription>설정된 텍스트 {activeTexts.length}개가 {(intervalMs / 1000).toFixed(1)}초 간격으로 "{ANIMATION_TYPES.find(a => a.value === animationType)?.label}" 효과로 전환됩니다.</CardDescription>
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
