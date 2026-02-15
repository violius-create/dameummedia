import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const DEFAULT_LABELS: Record<string, string> = {
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
  sub4_6Label: "진행상황",
  progressOption1: "접수중",
  progressOption2: "예약완료",
  progressOption3: "준비중",
  progressOption4: "작업중",
  progressOption5: "작업완료",
  progressOption6: "취소",
  eventTypeOption1: "사진 촬영",
  eventTypeOption2: "공연 촬영",
  eventTypeOption3: "영상 제작",
  eventTypeOption4: "뮤직비디오 제작",
  eventTypeOption5: "기타",
  recordingTypeOption1: "Photo",
  recordingTypeOption2: "Solo",
  recordingTypeOption3: "Recording",
  recordingTypeOption4: "Simple",
  recordingTypeOption5: "Basic",
  recordingTypeOption6: "Professional",
  specialReqOption1: "드론",
  specialReqOption2: "짐벌",
  specialReqOption3: "지미집",
  specialReqOption4: "기타",
  isPublicOption1: "허용",
  isPublicOption2: "불허",
  paymentMethodOption1: "카드",
  paymentMethodOption2: "계좌이체",
  paymentMethodOption3: "현금",
  receiptTypeOption1: "발행",
  receiptTypeOption2: "미발행",
  receiptTypeOption3: "간이영수증",
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
      const newData: Record<string, string> = {};
      for (const key of Object.keys(DEFAULT_LABELS)) {
        newData[key] = (labels as any)[key] || DEFAULT_LABELS[key];
      }
      setFormData(newData);
    }
  }, [labels]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData as any);
  };

  const handleReset = () => {
    if (confirm("모든 라벨을 기본값으로 초기화하시겠습니까?")) {
      setFormData(DEFAULT_LABELS);
      updateMutation.mutate(DEFAULT_LABELS as any);
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
      catKey: "cat1Label",
      subs: [
        { key: "sub1_1Label", default: DEFAULT_LABELS.sub1_1Label },
        { key: "sub1_2Label", default: DEFAULT_LABELS.sub1_2Label },
        { key: "sub1_3Label", default: DEFAULT_LABELS.sub1_3Label },
      ],
      options: [],
    },
    {
      title: "카테고리 2",
      color: "green",
      catKey: "cat2Label",
      subs: [
        { key: "sub2_1Label", default: DEFAULT_LABELS.sub2_1Label },
        { key: "sub2_2Label", default: DEFAULT_LABELS.sub2_2Label },
        { key: "sub2_3Label", default: DEFAULT_LABELS.sub2_3Label },
        { key: "sub2_4Label", default: DEFAULT_LABELS.sub2_4Label },
        { key: "sub2_5Label", default: DEFAULT_LABELS.sub2_5Label },
      ],
      options: [],
    },
    {
      title: "카테고리 3",
      color: "purple",
      catKey: "cat3Label",
      subs: [
        { key: "sub3_1Label", default: DEFAULT_LABELS.sub3_1Label },
        { key: "sub3_2Label", default: DEFAULT_LABELS.sub3_2Label },
        { key: "sub3_3Label", default: DEFAULT_LABELS.sub3_3Label },
        { key: "sub3_4Label", default: DEFAULT_LABELS.sub3_4Label },
      ],
      options: [
        {
          groupLabel: "분류 옵션 (라디오)",
          items: [
            { key: "eventTypeOption1", default: DEFAULT_LABELS.eventTypeOption1 },
            { key: "eventTypeOption2", default: DEFAULT_LABELS.eventTypeOption2 },
            { key: "eventTypeOption3", default: DEFAULT_LABELS.eventTypeOption3 },
            { key: "eventTypeOption4", default: DEFAULT_LABELS.eventTypeOption4 },
            { key: "eventTypeOption5", default: DEFAULT_LABELS.eventTypeOption5 },
          ],
        },
        {
          groupLabel: "촬영 유형 옵션 (라디오)",
          items: [
            { key: "recordingTypeOption1", default: DEFAULT_LABELS.recordingTypeOption1 },
            { key: "recordingTypeOption2", default: DEFAULT_LABELS.recordingTypeOption2 },
            { key: "recordingTypeOption3", default: DEFAULT_LABELS.recordingTypeOption3 },
            { key: "recordingTypeOption4", default: DEFAULT_LABELS.recordingTypeOption4 },
            { key: "recordingTypeOption5", default: DEFAULT_LABELS.recordingTypeOption5 },
            { key: "recordingTypeOption6", default: DEFAULT_LABELS.recordingTypeOption6 },
          ],
        },
        {
          groupLabel: "특수 요청 옵션 (체크박스)",
          items: [
            { key: "specialReqOption1", default: DEFAULT_LABELS.specialReqOption1 },
            { key: "specialReqOption2", default: DEFAULT_LABELS.specialReqOption2 },
            { key: "specialReqOption3", default: DEFAULT_LABELS.specialReqOption3 },
            { key: "specialReqOption4", default: DEFAULT_LABELS.specialReqOption4 },
          ],
        },
        {
          groupLabel: "공개 여부 옵션 (라디오)",
          items: [
            { key: "isPublicOption1", default: DEFAULT_LABELS.isPublicOption1 },
            { key: "isPublicOption2", default: DEFAULT_LABELS.isPublicOption2 },
          ],
        },
      ],
    },
    {
      title: "카테고리 4",
      color: "orange",
      catKey: "cat4Label",
      subs: [
        { key: "sub4_1Label", default: DEFAULT_LABELS.sub4_1Label },
        { key: "sub4_2Label", default: DEFAULT_LABELS.sub4_2Label },
        { key: "sub4_3Label", default: DEFAULT_LABELS.sub4_3Label },
        { key: "sub4_4Label", default: DEFAULT_LABELS.sub4_4Label },
        { key: "sub4_5Label", default: DEFAULT_LABELS.sub4_5Label },
        { key: "sub4_6Label", default: DEFAULT_LABELS.sub4_6Label },
      ],
      options: [
        {
          groupLabel: "결제 방식 옵션 (라디오)",
          items: [
            { key: "paymentMethodOption1", default: DEFAULT_LABELS.paymentMethodOption1 },
            { key: "paymentMethodOption2", default: DEFAULT_LABELS.paymentMethodOption2 },
            { key: "paymentMethodOption3", default: DEFAULT_LABELS.paymentMethodOption3 },
          ],
        },
        {
          groupLabel: "계산서 발행 옵션 (라디오)",
          items: [
            { key: "receiptTypeOption1", default: DEFAULT_LABELS.receiptTypeOption1 },
            { key: "receiptTypeOption2", default: DEFAULT_LABELS.receiptTypeOption2 },
            { key: "receiptTypeOption3", default: DEFAULT_LABELS.receiptTypeOption3 },
          ],
        },
      ],
    },
    {
      title: "카테고리 5",
      color: "red",
      catKey: "cat5Label",
      subs: [],
      options: [],
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
            예약 폼과 상세 페이지에 표시되는 카테고리, 서브항목, 라디오/체크박스 옵션의 이름을 수정할 수 있습니다. 변경 후 저장 버튼을 클릭하세요.
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
                  {(section.subs.length > 0 || section.options.length > 0) && (
                    <CardContent className="space-y-6">
                      {/* Sub-item labels */}
                      {section.subs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-3">서브항목 라벨</h4>
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
                        </div>
                      )}

                      {/* Radio/Checkbox option labels */}
                      {section.options.map((optGroup, oi) => (
                        <div key={oi}>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                            {optGroup.groupLabel}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {optGroup.items.map((item, ii) => (
                              <div key={item.key} className="bg-amber-50 rounded p-3 border border-amber-200">
                                <Label className="text-xs text-muted-foreground">옵션 {ii + 1} ({item.default})</Label>
                                <Input
                                  value={formData[item.key]}
                                  onChange={(e) => handleChange(item.key, e.target.value)}
                                  className="mt-1"
                                  placeholder={item.default}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {/* 진행상황 옵션 라벨 */}
            <Card className="bg-amber-50 border-l-4 border-amber-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-bold">
                    ⚙
                  </span>
                  <div>
                    <CardTitle className="text-lg text-amber-900">진행상황 옵션</CardTitle>
                    <p className="text-xs text-amber-700 mt-1">예약의 진행상황 선택 항목을 수정합니다. 예약 폼과 상세 페이지에서 사용됩니다.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {([
                    { key: "progressOption1", default: "접수중", num: 1 },
                    { key: "progressOption2", default: "예약완료", num: 2 },
                    { key: "progressOption3", default: "준비중", num: 3 },
                    { key: "progressOption4", default: "작업중", num: 4 },
                    { key: "progressOption5", default: "작업완료", num: 5 },
                    { key: "progressOption6", default: "취소", num: 6 },
                  ]).map((opt) => (
                    <div key={opt.key} className="bg-white rounded p-3 border border-amber-200">
                      <Label className="text-xs text-muted-foreground">옵션 {opt.num} ({opt.default})</Label>
                      <Input
                        value={formData[opt.key]}
                        onChange={(e) => handleChange(opt.key, e.target.value)}
                        className="mt-1"
                        placeholder={opt.default}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
