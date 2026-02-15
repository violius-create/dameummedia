import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ArrowLeft, Upload, Link2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Reservation() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Load dynamic form labels
  const { data: labels } = trpc.reservationFormLabels.get.useQuery();

  const [formData, setFormData] = useState({
    // 담당자 정보
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    // 행사 정보
    eventName: "",
    venue: "",
    eventDate: "",
    startTime: "",
    rehearsalTime: "",
    // 작업 내용
    eventType: "photo",
    recordingType: "Photo",
    specialRequirements: "",
    isPublic: "1",
    // 결제 정보
    paymentMethod: "card",
    receiptType: "issued",
    quotedAmount: "",
    paidAmount: "",
    unpaidAmount: "",
    // 프로그램 및 요청사항
    description: "",
    // 파일/링크 첨부
    attachments: "" as string,
    linkUrl: "",
  });

  const uploadFileMutation = trpc.upload.uploadFile.useMutation();

  const createReservationMutation = trpc.reservations.create.useMutation({
    onSuccess: (data) => {
      if (data && data.id) {
        toast.success("예약 신청이 완료되었습니다. 곧 연락드리겠습니다.");
        window.location.href = `/reservation/${data.id}`;
      }
    },
    onError: (error) => {
      toast.error(`예약 실패: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientEmail || !formData.eventName) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    const eventDateTime = formData.eventDate
      ? new Date(formData.eventDate)
      : undefined;

    createReservationMutation.mutate({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      eventName: formData.eventName,
      eventType: formData.eventType as any,
      venue: formData.venue,
      eventDate: eventDateTime,
      startTime: formData.startTime,
      rehearsalTime: formData.rehearsalTime,
      recordingType: formData.recordingType,
      specialRequirements: formData.specialRequirements,
      paymentMethod: formData.paymentMethod as any,
      isPublic: parseInt(formData.isPublic),
      receiptType: formData.receiptType as any,
      quotedAmount: formData.quotedAmount ? parseInt(formData.quotedAmount) : 0,
      paidAmount: formData.paidAmount ? parseInt(formData.paidAmount) : 0,
      unpaidAmount: calculatedUnpaid,
      progressStatus: (formData as any).progressStatus || undefined,
      description: formData.description,
      attachments: formData.attachments || undefined,
      linkUrl: formData.linkUrl || undefined,
      status: "pending",
    });
  };

  // Default labels
  const l = {
    cat1: labels?.cat1Label || "담당자 정보",
    cat2: labels?.cat2Label || "행사 정보",
    cat3: labels?.cat3Label || "작업 내용",
    cat4: labels?.cat4Label || "결제 정보",
    cat5: labels?.cat5Label || "프로그램 및 요청사항",
    sub1_1: labels?.sub1_1Label || "담당자 성함",
    sub1_2: labels?.sub1_2Label || "연락처",
    sub1_3: labels?.sub1_3Label || "이메일",
    sub2_1: labels?.sub2_1Label || "행사명",
    sub2_2: labels?.sub2_2Label || "장소",
    sub2_3: labels?.sub2_3Label || "행사 날짜",
    sub2_4: labels?.sub2_4Label || "시작 시간",
    sub2_5: labels?.sub2_5Label || "리허설 시간",
    sub3_1: labels?.sub3_1Label || "분류",
    sub3_2: labels?.sub3_2Label || "촬영 유형",
    sub3_3: labels?.sub3_3Label || "특수 요청",
    sub3_4: labels?.sub3_4Label || "공개 여부",
    sub4_1: labels?.sub4_1Label || "결제 방식",
    sub4_2: labels?.sub4_2Label || "계산서 발행",
    sub4_3: labels?.sub4_3Label || "견적액",
    sub4_4: labels?.sub4_4Label || "결제된 금액",
    sub4_5: labels?.sub4_5Label || "미납 금액",
    sub4_6: labels?.sub4_6Label || "진행상황",
  };

  // Progress status options from labels
  const progressOptions = [
    labels?.progressOption1 || "접수중",
    labels?.progressOption2 || "예약완료",
    labels?.progressOption3 || "준비중",
    labels?.progressOption4 || "작업중",
    labels?.progressOption5 || "작업완료",
    labels?.progressOption6 || "취소",
  ];

  // Auto-calculate unpaid amount
  const calculatedUnpaid = (parseInt(formData.quotedAmount) || 0) - (parseInt(formData.paidAmount) || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <Link href="/reservation">
            <Button variant="ghost" size="sm" className="text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">예약하기</h1>
            <p className="text-lg text-muted-foreground">
              당신의 프로젝트에 대해 알려주세요. 전문가 팀이 최적의 서비스를 제공해드립니다.
            </p>
          </div>

          {/* Form */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">예약 신청 양식</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* ===== 카테고리 1: 담당자 정보 ===== */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                    {l.cat1}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        {l.sub1_1} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="clientName"
                        placeholder="홍길동"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">{l.sub1_2}</Label>
                      <Input
                        id="clientPhone"
                        placeholder="010-1234-5678"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">
                        {l.sub1_3} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ===== 카테고리 2: 행사 정보 ===== */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                    {l.cat2}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">
                        {l.sub2_1} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="eventName"
                        placeholder="예: 2025 신년음악회"
                        value={formData.eventName}
                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="venue">{l.sub2_2}</Label>
                      <Input
                        id="venue"
                        placeholder="예: 부천아트홀"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">{l.sub2_3}</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">{l.sub2_4}</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rehearsalTime">{l.sub2_5}</Label>
                      <Input
                        id="rehearsalTime"
                        placeholder="예: 오후 2시 예상"
                        value={formData.rehearsalTime}
                        onChange={(e) => setFormData({ ...formData, rehearsalTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* ===== 카테고리 3: 작업 내용 ===== */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                    {l.cat3}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 분류 - 라디오 */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>{l.sub3_1} <span className="text-red-500">*</span></Label>
                      <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-md">
                        {[
                          { value: "photo", label: "사진 촬영" },
                          { value: "concert", label: "공연 촬영" },
                          { value: "video", label: "영상 제작" },
                          { value: "music_video", label: "뮤직비디오 제작" },
                          { value: "other", label: "기타" },
                        ].map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="eventType"
                              value={opt.value}
                              checked={formData.eventType === opt.value}
                              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 촬영 유형 - 라디오 */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>{l.sub3_2}</Label>
                      <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-md">
                        {["Photo", "Solo", "Recording", "Simple", "Basic", "Professional"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="recordingType"
                              value={opt}
                              checked={formData.recordingType === opt}
                              onChange={(e) => setFormData({ ...formData, recordingType: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 특수 요청 - 체크박스 */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>{l.sub3_3}</Label>
                      <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-md">
                        {["드론", "짐벌", "지미집", "기타"].map((opt) => {
                          const currentReqs = formData.specialRequirements ? formData.specialRequirements.split(",").map(s => s.trim()).filter(Boolean) : [];
                          const isChecked = currentReqs.includes(opt);
                          return (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const newReqs = isChecked
                                    ? currentReqs.filter(r => r !== opt)
                                    : [...currentReqs, opt];
                                  setFormData({ ...formData, specialRequirements: newReqs.join(", ") });
                                }}
                                className="w-4 h-4"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* 공개 여부 - 라디오 */}
                    <div className="space-y-2">
                      <Label>{l.sub3_4}</Label>
                      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isPublic"
                            value="1"
                            checked={formData.isPublic === "1"}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>허용</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isPublic"
                            value="0"
                            checked={formData.isPublic === "0"}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>불허</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===== 카테고리 4: 결제 정보 ===== */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
                    {l.cat4}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 결제 방식 */}
                    <div className="space-y-2">
                      <Label>{l.sub4_1}</Label>
                      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
                        {[
                          { value: "card", label: "카드" },
                          { value: "transfer", label: "계좌이체" },
                          { value: "cash", label: "현금" },
                        ].map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={opt.value}
                              checked={formData.paymentMethod === opt.value}
                              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 계산서 발행 */}
                    <div className="space-y-2">
                      <Label>{l.sub4_2}</Label>
                      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
                        {[
                          { value: "issued", label: "발행" },
                          { value: "not_issued", label: "미발행" },
                          { value: "cash_receipt", label: "간이영수증" },
                        ].map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="receiptType"
                              value={opt.value}
                              checked={formData.receiptType === opt.value}
                              onChange={(e) => setFormData({ ...formData, receiptType: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 견적액, 결제된 금액, 미납 금액 - 관리자만 */}
                    {isAdmin && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="quotedAmount">
                            {l.sub4_3} <span className="text-xs text-red-600">(관리자 전용)</span>
                          </Label>
                          <Input
                            id="quotedAmount"
                            type="text"
                            placeholder="0"
                            value={formData.quotedAmount}
                            onChange={(e) => setFormData({ ...formData, quotedAmount: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paidAmount">
                            {l.sub4_4} <span className="text-xs text-red-600">(관리자 전용)</span>
                          </Label>
                          <Input
                            id="paidAmount"
                            type="text"
                            placeholder="0"
                            value={formData.paidAmount}
                            onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unpaidAmount">
                            {l.sub4_5} <span className="text-xs text-muted-foreground">(자동계산)</span>
                          </Label>
                          <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/50">
                            <span className="text-sm font-semibold text-red-600">{calculatedUnpaid.toLocaleString()}원</span>
                          </div>
                        </div>
                      </>
                    )}
                    {/* 진행상황 - 관리자만 */}
                    {isAdmin && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>{l.sub4_6} <span className="text-xs text-red-600">(관리자 전용)</span></Label>
                        <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-md">
                          {progressOptions.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="progressStatus"
                                value={opt}
                                checked={(formData as any).progressStatus === opt}
                                onChange={(e) => setFormData({ ...formData, progressStatus: e.target.value } as any)}
                                className="w-4 h-4"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== 카테고리 5: 프로그램 및 요청사항 ===== */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">5</span>
                    {l.cat5}
                  </h3>
                  
                  <div className="space-y-2">
                    <RichTextEditor
                      content={formData.description}
                      onChange={(html) => setFormData({ ...formData, description: html })}
                      placeholder="프로그램 내용이나 추가 요청사항을 입력하세요..."
                    />
                  </div>
                </div>

                {/* ===== 파일 첨부 ===== */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    파일 첨부
                  </h3>
                  <div className="bg-white rounded p-4 border-2 border-dashed border-blue-400 bg-blue-50">
                    <div className="mt-2">
                      <Input
                        id="attachments"
                        type="file"
                        multiple
                        className="cursor-pointer bg-white border-blue-300 hover:border-blue-500 file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:cursor-pointer file:hover:bg-blue-700"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          
                          const uploadedUrls: string[] = [];
                          
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const reader = new FileReader();
                            
                            await new Promise((resolve) => {
                              reader.onload = async () => {
                                try {
                                  const base64 = reader.result as string;
                                  const fileData = base64.split(',')[1];
                                  
                                  const result = await uploadFileMutation.mutateAsync({
                                    fileName: file.name,
                                    fileData,
                                    mimeType: file.type,
                                  });
                                  
                                  uploadedUrls.push(result.url);
                                  resolve(null);
                                } catch (error) {
                                  console.error('File upload error:', error);
                                  toast.error(`파일 업로드 실패: ${file.name}`);
                                  resolve(null);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                          
                          if (uploadedUrls.length > 0) {
                            const existingAttachments = formData.attachments ? JSON.parse(formData.attachments) : [];
                            const newAttachments = [...existingAttachments, ...uploadedUrls];
                            setFormData((prev) => ({ ...prev, attachments: JSON.stringify(newAttachments) }));
                            toast.success(`${uploadedUrls.length}개 파일이 업로드되었습니다.`);
                          }
                        }}
                      />
                      {formData.attachments && (
                        <div className="mt-2 space-y-1">
                          {JSON.parse(formData.attachments).map((url: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                첨부파일 {index + 1}
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  const attachments = JSON.parse(formData.attachments);
                                  const newAttachments = attachments.filter((_: string, i: number) => i !== index);
                                  setFormData((prev) => ({ ...prev, attachments: newAttachments.length > 0 ? JSON.stringify(newAttachments) : "" }));
                                }}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== 링크 첨부 ===== */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    링크 첨부
                  </h3>
                  <div className="space-y-2">
                    <Input
                      id="linkUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">유효한 링크를 입력하면 예약 상세 페이지에서 확인할 수 있습니다.</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createReservationMutation.isPending}
                  >
                    {createReservationMutation.isPending ? "예약 신청 중..." : "예약 신청하기"}
                  </Button>
                  <Link href="/">
                    <Button type="button" variant="outline" className="flex-1">
                      취소
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
