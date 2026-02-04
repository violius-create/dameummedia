import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Reservation() {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    eventName: "",
    eventType: "concert",
    venue: "",
    eventDate: "",
    eventTime: "",
    rehearsalTime: "",
    composition: "",
    managerName: "",
    managerPhone: "",
    recordingStaff: "신청",
    photographyStaff: "",
    audioSettings: "",
    paymentMethod: "card",
    isPublic: "1",
    receiptType: "issued",
    paidAmount: "",
    unpaidAmount: "",
    description: "",
  });

  const createReservationMutation = trpc.reservations.create.useMutation({
    onSuccess: (data) => {
      if (data && data.id) {
        toast.success("예약 신청이 완료되었습니다. 곧 연락드리겠습니다.");
        // 예약 상세 페이지로 리다이렉트
        window.location.href = `/reservation/${data.id}`;
      }
    },
    onError: (error) => {
      toast.error(`예약 실패: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (!formData.clientName || !formData.clientEmail || !formData.eventName) {
      toast.error("필수 항목을 모두 입력해주세요.");
      console.log('Validation failed:', { clientName: formData.clientName, clientEmail: formData.clientEmail, eventName: formData.eventName });
      return;
    }

    const eventDateTime = formData.eventDate && formData.eventTime 
      ? new Date(`${formData.eventDate}T${formData.eventTime}`)
      : new Date(formData.eventDate);

    createReservationMutation.mutate({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      eventName: formData.eventName,
      eventType: formData.eventType as any,
      venue: formData.venue,
      eventDate: eventDateTime,
      rehearsalTime: formData.rehearsalTime,
      composition: formData.composition,
      managerName: formData.managerName,
      managerPhone: formData.managerPhone,
      recordingStaff: formData.recordingStaff,
      photographyStaff: formData.photographyStaff,
      audioSettings: formData.audioSettings,
      paymentMethod: formData.paymentMethod as any,
      isPublic: parseInt(formData.isPublic),
      receiptType: formData.receiptType as any,
      paidAmount: formData.paidAmount ? parseInt(formData.paidAmount) : 0,
      unpaidAmount: formData.unpaidAmount ? parseInt(formData.unpaidAmount) : 0,
      description: formData.description,
      status: "pending",
    });
  };

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
        <div className="max-w-4xl mx-auto space-y-8">
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
                {/* Section 1: 기본 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">기본 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">
                        이메일 <span className="text-red-500">*</span>
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

                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        담당자 성함 <span className="text-red-500">*</span>
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
                      <Label htmlFor="clientPhone">
                        연락처
                      </Label>
                      <Input
                        id="clientPhone"
                        placeholder="010-1234-5678"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventType">
                        문류 <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="eventType"
                            value="concert"
                            checked={formData.eventType === "concert"}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>콘서트</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="eventType"
                            value="film"
                            checked={formData.eventType === "film"}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>영상 제작</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="eventType"
                            value="other"
                            checked={formData.eventType === "other"}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>기타</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: 행사 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">행사 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">
                        행사명 <span className="text-red-500">*</span>
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
                      <Label htmlFor="venue">
                        장소(공연장)
                      </Label>
                      <Input
                        id="venue"
                        placeholder="예: 부천아트홀"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">
                        날짜
                      </Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventTime">
                        공연시간
                      </Label>
                      <Input
                        id="eventTime"
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rehearsalTime">
                        리허설시간
                      </Label>
                      <Input
                        id="rehearsalTime"
                        placeholder="예: 오후 2시 예상"
                        value={formData.rehearsalTime}
                        onChange={(e) => setFormData({ ...formData, rehearsalTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="composition">
                        편성·인원
                      </Label>
                      <Input
                        id="composition"
                        placeholder="예: 3명"
                        value={formData.composition}
                        onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: 담당자 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">담당자 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">
                        담당자 성함/연락처
                      </Label>
                      <Input
                        id="managerName"
                        placeholder="홍길동"
                        value={formData.managerName}
                        onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="managerPhone">
                        담당자 연락처
                      </Label>
                      <Input
                        id="managerPhone"
                        placeholder="010-1234-5678"
                        value={formData.managerPhone}
                        onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recordingStaff">
                        녹음신청
                      </Label>
                      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recordingStaff"
                            value="신청"
                            checked={formData.recordingStaff === "신청"}
                            onChange={(e) => setFormData({ ...formData, recordingStaff: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>신청</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recordingStaff"
                            value="미신청"
                            checked={formData.recordingStaff === "미신청"}
                            onChange={(e) => setFormData({ ...formData, recordingStaff: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>미신청</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photographyStaff">
                        사진촬영 주자
                      </Label>
                      <Input
                        id="photographyStaff"
                        placeholder="신청"
                        value={formData.photographyStaff}
                        onChange={(e) => setFormData({ ...formData, photographyStaff: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audioSettings">
                        촬영(녹음) 음선
                      </Label>
                      <Input
                        id="audioSettings"
                        placeholder="Economy"
                        value={formData.audioSettings}
                        onChange={(e) => setFormData({ ...formData, audioSettings: e.target.value })}
                      />
                    </div>


                  </div>
                </div>

                {/* Section 4: 결제 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">결제 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">
                        결제방식
                      </Label>
                      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === "card"}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>카드</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="transfer"
                            checked={formData.paymentMethod === "transfer"}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>계좌이체</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={formData.paymentMethod === "cash"}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>현금</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiptType">
                        계산서발행
                      </Label>
                      <div className="flex gap-4 p-3 bg-muted/30 rounded-md">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="receiptType"
                            value="issued"
                            checked={formData.receiptType === "issued"}
                            onChange={(e) => setFormData({ ...formData, receiptType: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>발행</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="receiptType"
                            value="not_issued"
                            checked={formData.receiptType === "not_issued"}
                            onChange={(e) => setFormData({ ...formData, receiptType: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>미발행</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="receiptType"
                            value="cash_receipt"
                            checked={formData.receiptType === "cash_receipt"}
                            onChange={(e) => setFormData({ ...formData, receiptType: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>현금영수증</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">
                        결제된 금액
                      </Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        placeholder="0"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unpaidAmount">
                        미납 금액
                      </Label>
                      <Input
                        id="unpaidAmount"
                        type="number"
                        placeholder="0"
                        value={formData.unpaidAmount}
                        onChange={(e) => setFormData({ ...formData, unpaidAmount: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isPublic">
                        공개 허용
                      </Label>
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
                          <span>거부</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: 추가 정보 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">추가 정보</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      기타 사항
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="추가로 알려주실 사항이 있으신가요?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                    />
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
