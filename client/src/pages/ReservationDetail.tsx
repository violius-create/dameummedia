import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

export default function ReservationDetail() {
  const [, params] = useRoute("/reservation/:id");
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const id = params?.id ? parseInt(params.id) : null;

  const { data: reservation, isLoading } = trpc.reservations.getById.useQuery(
    { id: id! },
    { enabled: !!id && user?.role === "admin" }
  );

  const deleteReservationMutation = trpc.reservations.delete.useMutation({
    onSuccess: () => {
      toast.success("예약이 삭제되었습니다.");
      window.location.href = "/admin";
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (confirm("정말 이 예약을 삭제하시겠습니까?")) {
      setIsDeleting(true);
      deleteReservationMutation.mutate({ id: id! });
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">관리자만 접근할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로드 중...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">예약을 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <Link href="/admin">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">예약 상세 정보</h1>
              <p className="text-lg text-muted-foreground mt-2">예약 ID: {reservation.id}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin?edit=reservation&id=${reservation.id}`}>
                <Button variant="outline" size="sm" className="text-foreground">
                  <Edit className="mr-2 h-4 w-4" />
                  수정
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>

          {/* Details */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">이메일</p>
                  <p className="text-foreground mt-1">{reservation.clientEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">문류</p>
                  <p className="text-foreground mt-1">
                    {reservation.eventType === "concert"
                      ? "콘서트"
                      : reservation.eventType === "film"
                      ? "영상 제작"
                      : "기타"}
                  </p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">행사명</p>
                  <p className="text-foreground mt-1">{reservation.eventName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">장소(공연장)</p>
                  <p className="text-foreground mt-1">{reservation.venue || "-"}</p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">날짜·공연시간</p>
                  <p className="text-foreground mt-1">{formatDate(reservation.eventDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">리허설시간</p>
                  <p className="text-foreground mt-1">{reservation.rehearsalTime || "-"}</p>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">편성·인원</p>
                  <p className="text-foreground mt-1">{reservation.composition || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">담당자 성함/연락처</p>
                  <p className="text-foreground mt-1">
                    {reservation.managerName || "-"}
                    {reservation.managerPhone ? ` / ${reservation.managerPhone}` : ""}
                  </p>
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">녹음주자</p>
                  <p className="text-foreground mt-1">{reservation.recordingStaff || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">사진촬영 주자</p>
                  <p className="text-foreground mt-1">{reservation.photographyStaff || "-"}</p>
                </div>
              </div>

              {/* Row 6 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">촬영(녹음) 음선</p>
                  <p className="text-foreground mt-1 whitespace-pre-wrap">
                    {reservation.audioSettings || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">프로젝트모니터 주자</p>
                  <p className="text-foreground mt-1">{reservation.projectMonitor || "-"}</p>
                </div>
              </div>

              {/* Row 7 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">결제방식</p>
                  <p className="text-foreground mt-1">
                    {reservation.paymentMethod === "card"
                      ? "카드"
                      : reservation.paymentMethod === "transfer"
                      ? "계좌이체"
                      : reservation.paymentMethod === "cash"
                      ? "현금"
                      : "기타"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">공개 허용</p>
                  <p className="text-foreground mt-1">
                    {reservation.isPublic ? "허용" : "비허용"}
                  </p>
                </div>
              </div>

              {/* Row 8 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">접수형태</p>
                  <p className="text-foreground mt-1">
                    {reservation.receiptType === "individual"
                      ? "개인"
                      : reservation.receiptType === "business"
                      ? "사업자"
                      : "기타"}
                  </p>
                </div>
              </div>

              {/* Row 9 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">결제된 금액</p>
                  <p className="text-foreground mt-1 font-semibold">
                    {formatCurrency(reservation.paidAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">미납 금액</p>
                  <p className="text-foreground mt-1 font-semibold">
                    {formatCurrency(reservation.unpaidAmount || 0)}
                  </p>
                </div>
              </div>

              {/* Row 10 */}
              <div>
                <p className="text-sm text-muted-foreground font-medium">프로젝트 설명</p>
                <p className="text-foreground mt-2 whitespace-pre-wrap">
                  {reservation.description || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="border border-border bg-card/50">
            <CardHeader>
              <CardTitle className="text-foreground text-sm">메타정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">상태</span>
                <span className="text-foreground font-medium">
                  {reservation.status === "pending"
                    ? "대기 중"
                    : reservation.status === "confirmed"
                    ? "확정됨"
                    : reservation.status === "completed"
                    ? "완료됨"
                    : "취소됨"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">생성 일시</span>
                <span className="text-foreground">{formatDate(reservation.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">수정 일시</span>
                <span className="text-foreground">{formatDate(reservation.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
