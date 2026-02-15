import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const DEFAULT_LABELS = {
  cat1Label: "담당자 정보",
  cat2Label: "행사 정보",
  cat3Label: "작업 내용",
  cat4Label: "결제 정보",
  cat5Label: "프로그램 및 요청사항",
  sub1_1Label: "담당자 성함",
  sub1_2Label: "연락처",
  sub1_3Label: "이메일",
  sub2_1Label: "행사명",
  sub2_2Label: "장소",
  sub2_3Label: "행사 날짜",
  sub2_4Label: "시작 시간",
  sub2_5Label: "리허설 시간",
  sub3_1Label: "분류",
  sub3_2Label: "촬영 유형",
  sub3_3Label: "특수 요청",
  sub3_4Label: "공개 여부",
  sub4_1Label: "결제 방식",
  sub4_2Label: "계산서 발행",
  sub4_3Label: "견적액",
  sub4_4Label: "결제된 금액",
  sub4_5Label: "미납 금액",
};

type LabelKey = keyof typeof DEFAULT_LABELS;

export default function AdminReservationLabels() {
  const { data: labels, isLoading } = trpc.reservationFormLabels.get.useQuery();
  const updateMutation = trpc.reservationFormLabels.update.useMutation({
    onSuccess: () => {
      toast.success("라벨이 저장되었습니다.");
    },
    onError: (error) => {
      toast.error(`저장 실패: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState(DEFAULT_LABELS);

  useEffect(() => {
    if (labels) {
      setFormData({
        cat1Label: labels.cat1Label || DEFAULT_LABELS.cat1Label,
        cat2Label: labels.cat2Label || DEFAULT_LABELS.cat2Label,
        cat3Label: labels.cat3Label || DEFAULT_LABELS.cat3Label,
        cat4Label: labels.cat4Label || DEFAULT_LABELS.cat4Label,
        cat5Label: labels.cat5Label || DEFAULT_LABELS.cat5Label,
        sub1_1Label: labels.sub1_1Label || DEFAULT_LABELS.sub1_1Label,
        sub1_2Label: labels.sub1_2Label || DEFAULT_LABELS.sub1_2Label,
        sub1_3Label: labels.sub1_3Label || DEFAULT_LABELS.sub1_3Label,
        sub2_1Label: labels.sub2_1Label || DEFAULT_LABELS.sub2_1Label,
        sub2_2Label: labels.sub2_2Label || DEFAULT_LABELS.sub2_2Label,
        sub2_3Label: labels.sub2_3Label || DEFAULT_LABELS.sub2_3Label,
        sub2_4Label: labels.sub2_4Label || DEFAULT_LABELS.sub2_4Label,
        sub2_5Label: labels.sub2_5Label || DEFAULT_LABELS.sub2_5Label,
        sub3_1Label: labels.sub3_1Label || DEFAULT_LABELS.sub3_1Label,
        sub3_2Label: labels.sub3_2Label || DEFAULT_LABELS.sub3_2Label,
        sub3_3Label: labels.sub3_3Label || DEFAULT_LABELS.sub3_3Label,
        sub3_4Label: labels.sub3_4Label || DEFAULT_LABELS.sub3_4Label,
        sub4_1Label: labels.sub4_1Label || DEFAULT_LABELS.sub4_1Label,
        sub4_2Label: labels.sub4_2Label || DEFAULT_LABELS.sub4_2Label,
        sub4_3Label: labels.sub4_3Label || DEFAULT_LABELS.sub4_3Label,
        sub4_4Label: labels.sub4_4Label || DEFAULT_LABELS.sub4_4Label,
        sub4_5Label: labels.sub4_5Label || DEFAULT_LABELS.sub4_5Label,
      });
    }
  }, [labels]);

  const handleChange = (key: LabelKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    if (confirm("모든 라벨을 기본값으로 초기화하시겠습니까?")) {
      setFormData(DEFAULT_LABELS);
      updateMutation.mutate(DEFAULT_LABELS);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sections = [
    {
      title: "카테고리 1",
      color: "blue",
      catKey: "cat1Label" as LabelKey,
      subs: [
        { key: "sub1_1Label" as LabelKey, default: DEFAULT_LABELS.sub1_1Label },
        { key: "sub1_2Label" as LabelKey, default: DEFAULT_LABELS.sub1_2Label },
        { key: "sub1_3Label" as LabelKey, default: DEFAULT_LABELS.sub1_3Label },
      ],
    },
    {
      title: "카테고리 2",
      color: "green",
      catKey: "cat2Label" as LabelKey,
      subs: [
        { key: "sub2_1Label" as LabelKey, default: DEFAULT_LABELS.sub2_1Label },
        { key: "sub2_2Label" as LabelKey, default: DEFAULT_LABELS.sub2_2Label },
        { key: "sub2_3Label" as LabelKey, default: DEFAULT_LABELS.sub2_3Label },
        { key: "sub2_4Label" as LabelKey, default: DEFAULT_LABELS.sub2_4Label },
        { key: "sub2_5Label" as LabelKey, default: DEFAULT_LABELS.sub2_5Label },
      ],
    },
    {
      title: "카테고리 3",
      color: "purple",
      catKey: "cat3Label" as LabelKey,
      subs: [
        { key: "sub3_1Label" as LabelKey, default: DEFAULT_LABELS.sub3_1Label },
        { key: "sub3_2Label" as LabelKey, default: DEFAULT_LABELS.sub3_2Label },
        { key: "sub3_3Label" as LabelKey, default: DEFAULT_LABELS.sub3_3Label },
        { key: "sub3_4Label" as LabelKey, default: DEFAULT_LABELS.sub3_4Label },
      ],
    },
    {
      title: "카테고리 4",
      color: "orange",
      catKey: "cat4Label" as LabelKey,
      subs: [
        { key: "sub4_1Label" as LabelKey, default: DEFAULT_LABELS.sub4_1Label },
        { key: "sub4_2Label" as LabelKey, default: DEFAULT_LABELS.sub4_2Label },
        { key: "sub4_3Label" as LabelKey, default: DEFAULT_LABELS.sub4_3Label },
        { key: "sub4_4Label" as LabelKey, default: DEFAULT_LABELS.sub4_4Label },
        { key: "sub4_5Label" as LabelKey, default: DEFAULT_LABELS.sub4_5Label },
      ],
    },
    {
      title: "카테고리 5",
      color: "red",
      catKey: "cat5Label" as LabelKey,
      subs: [],
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; subBg: string; subBorder: string }> = {
    blue: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-900", subBg: "bg-white", subBorder: "border-blue-200" },
    green: { bg: "bg-green-50", border: "border-green-500", text: "text-green-900", subBg: "bg-white", subBorder: "border-green-200" },
    purple: { bg: "bg-purple-50", border: "border-purple-500", text: "text-purple-900", subBg: "bg-white", subBorder: "border-purple-200" },
    orange: { bg: "bg-orange-50", border: "border-orange-500", text: "text-orange-900", subBg: "bg-white", subBorder: "border-orange-200" },
    red: { bg: "bg-red-50", border: "border-red-500", text: "text-red-900", subBg: "bg-white", subBorder: "border-red-200" },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  돌아가기
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">예약 폼 라벨 관리</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                기본값 초기화
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                저장
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            예약 폼과 상세 페이지에 표시되는 카테고리 및 서브항목의 이름을 수정할 수 있습니다. 변경 후 저장 버튼을 클릭하세요.
          </p>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, idx) => {
              const cc = colorClasses[section.color];
              return (
                <Card key={idx} className={`${cc.bg} border-l-4 ${cc.border}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-${section.color}-500 text-white text-sm font-bold`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <Label className={`text-xs font-medium ${cc.text} opacity-70`}>카테고리 이름</Label>
                        <Input
                          value={formData[section.catKey]}
                          onChange={(e) => handleChange(section.catKey, e.target.value)}
                          className="mt-1 font-bold text-lg bg-white"
                          placeholder={DEFAULT_LABELS[section.catKey]}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {section.subs.length > 0 && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.subs.map((sub) => (
                          <div key={sub.key} className={`${cc.subBg} rounded p-3 border ${cc.subBorder}`}>
                            <Label className="text-xs text-muted-foreground">서브항목 ({sub.default})</Label>
                            <Input
                              value={formData[sub.key]}
                              onChange={(e) => handleChange(sub.key, e.target.value)}
                              className="mt-1"
                              placeholder={sub.default}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Bottom Save */}
          <div className="mt-8 flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              기본값 초기화
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
