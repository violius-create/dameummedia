import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    recordingStaff: "",
    photographyStaff: "",
    audioSettings: "",
    projectMonitor: "",
    paymentMethod: "card",
    isPublic: "1",
    receiptType: "individual",
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
      projectMonitor: formData.projectMonitor,
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
                      <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value })}>
                        <SelectTrigger id="eventType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concert">콘서트</SelectItem>
                          <SelectItem value="film">영상 제작</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
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
                        녹음주자
                      </Label>
                      <Input
                        id="recordingStaff"
                        placeholder="신청"
                        value={formData.recordingStaff}
                        onChange={(e) => setFormData({ ...formData, recordingStaff: e.target.value })}
                      />
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

                    <div className="space-y-2">
                      <Label htmlFor="projectMonitor">
                        프로젝트모니 주자
                      </Label>
                      <Input
                        id="projectMonitor"
                        placeholder="안함"
                        value={formData.projectMonitor}
                        onChange={(e) => setFormData({ ...formData, projectMonitor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: 결제 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">결제 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>
                        결제방식
                      </Label>
                      <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })} className="flex flex-row gap-6 p-3 rounded-md bg-muted/30">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="payment-card" />
                          <Label htmlFor="payment-card" className="font-normal cursor-pointer">카드</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="transfer" id="payment-transfer" />
                          <Label htmlFor="payment-transfer" className="font-normal cursor-pointer">계좌이체</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="payment-cash" />
                          <Label htmlFor="payment-cash" className="font-normal cursor-pointer">현금</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>
                        계산서 발행
                      </Label>
                      <RadioGroup value={formData.receiptType} onValueChange={(value) => setFormData({ ...formData, receiptType: value })} className="flex flex-row gap-6 p-3 rounded-md bg-muted/30">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="issued" id="receipt-issued" />
                          <Label htmlFor="receipt-issued" className="font-normal cursor-pointer">발행</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="not_issued" id="receipt-not-issued" />
                          <Label htmlFor="receipt-not-issued" className="font-normal cursor-pointer">미발행</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash_receipt" id="receipt-cash" />
                          <Label htmlFor="receipt-cash" className="font-normal cursor-pointer">현금영수증</Label>
                        </div>
                      </RadioGroup>
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
                      <Select value={formData.isPublic} onValueChange={(value) => setFormData({ ...formData, isPublic: value })}>
                        <SelectTrigger id="isPublic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">허용</SelectItem>
                          <SelectItem value="0">거부</SelectItem>
                        </SelectContent>
                      </Select>
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
