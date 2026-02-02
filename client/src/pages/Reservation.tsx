import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Reservation() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "concert",
    location: "",
    description: "",
    budget: "",
  });

  const createReservationMutation = trpc.reservations.create.useMutation({
    onSuccess: () => {
      toast.success("예약 신청이 완료되었습니다. 곧 연락드리겠습니다.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventDate: "",
        eventType: "concert",
        location: "",
        description: "",
        budget: "",
      });
    },
    onError: (error) => {
      toast.error(`예약 실패: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.eventDate) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    createReservationMutation.mutate({
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      eventDate: new Date(formData.eventDate),
      eventType: formData.eventType as any,
      location: formData.location,
      description: formData.description,
      budget: formData.budget ? parseInt(formData.budget) : undefined,
      status: "pending",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">예약하기</h1>
            <p className="text-lg text-muted-foreground">
              당신의 프로젝트에 대해 알려주세요. 전문가 팀이 최적의 서비스를 제공해드립니다.
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>예약 신청 양식</CardTitle>
              <CardDescription>
                필수 항목(*)을 모두 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    전화번호 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label htmlFor="eventDate">
                    행사 예정일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">
                    행사 유형 <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value })}>
                    <SelectTrigger id="eventType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concert">콘서트</SelectItem>
                      <SelectItem value="festival">페스티벌</SelectItem>
                      <SelectItem value="recording">음악 녹음</SelectItem>
                      <SelectItem value="musicvideo">뮤직 비디오</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">
                    행사 장소
                  </Label>
                  <Input
                    id="location"
                    placeholder="서울시 강남구 ..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    예상 예산 (원)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="3,000,000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    프로젝트 설명
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="당신의 프로젝트에 대해 자세히 설명해주세요..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createReservationMutation.isPending}
                >
                  {createReservationMutation.isPending ? "신청 중..." : "예약 신청하기"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>연락처</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">전화</p>
                  <p className="text-sm text-muted-foreground">02-1234-5678</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">이메일</p>
                  <p className="text-sm text-muted-foreground">info@dameum.kr</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">주소</p>
                  <p className="text-sm text-muted-foreground">서울시 강남구 ...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
