import { useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit2, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function ReservationDetail() {
  const [, params] = useRoute("/reservation/:id");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const id = params?.id ? parseInt(params.id) : null;

  const { data: reservation, isLoading, refetch } = trpc.reservations.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  // 예약 업데이트 뮤테이션
  const updateMutation = trpc.reservations.update.useMutation({
    onSuccess: () => {
      toast.success("예약이 수정되었습니다.");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`수정 실패: ${error.message}`);
    },
  });

  // 예약 삭제 뮤테이션
  const deleteMutation = trpc.reservations.delete.useMutation({
    onSuccess: () => {
      toast.success("예약이 삭제되었습니다.");
      window.location.href = "/reservation";
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  const handleEdit = () => {
    setEditData(reservation);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editData) return;

    updateMutation.mutate({
      id: id!,
      data: {
        clientName: editData.clientName,
        clientEmail: editData.clientEmail,
        clientPhone: editData.clientPhone,
        eventName: editData.eventName,
        eventType: editData.eventType,
        venue: editData.venue,
        eventDate: editData.eventDate,
        rehearsalTime: editData.rehearsalTime,
        composition: editData.composition,
        managerName: editData.managerName,
        managerPhone: editData.managerPhone,
        recordingStaff: editData.recordingStaff,
        photographyStaff: editData.photographyStaff,
        audioSettings: editData.audioSettings,
        projectMonitor: editData.projectMonitor,
        paymentMethod: editData.paymentMethod,
        isPublic: editData.isPublic,
        receiptType: editData.receiptType,
        paidAmount: editData.paidAmount,
        unpaidAmount: editData.unpaidAmount,
        description: editData.description,
        status: editData.status,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("정말 이 예약을 삭제하시겠습니까?")) {
      deleteMutation.mutate({ id: id! });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background">
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
        <div className="container py-16">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">예약을 찾을 수 없습니다.</p>
            <Link href="/reservation-board">
              <Button>게시판으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayData = isEditing && editData ? editData : reservation;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Link href="/reservation">
                <Button variant="ghost" size="sm" className="text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  목록 보기
                </Button>
              </Link>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData(null);
                    }}
                  >
                    취소
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">
                {displayData.eventName || "제목 없음"}
              </h1>
              <span className={`px-4 py-2 rounded text-sm font-medium ${
                displayData.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : displayData.status === 'confirmed'
                  ? 'bg-blue-100 text-blue-800'
                  : displayData.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {displayData.status === 'pending' ? '대기중' : 
                 displayData.status === 'confirmed' ? '확정' :
                 displayData.status === 'completed' ? '완료' :
                 '취소'}
              </span>
            </div>
            <p className="text-muted-foreground">
              작성자: {displayData.clientName} | {new Date(displayData.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* Form */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">예약 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Section 1: 기본 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">기본 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">이메일</Label>
                      {isEditing ? (
                        <Input
                          id="clientEmail"
                          type="email"
                          value={editData?.clientEmail || ""}
                          onChange={(e) => setEditData({ ...editData, clientEmail: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.clientEmail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientName">담당자 성함</Label>
                      {isEditing ? (
                        <Input
                          id="clientName"
                          value={editData?.clientName || ""}
                          onChange={(e) => setEditData({ ...editData, clientName: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.clientName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">연락처</Label>
                      {isEditing ? (
                        <Input
                          id="clientPhone"
                          value={editData?.clientPhone || ""}
                          onChange={(e) => setEditData({ ...editData, clientPhone: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.clientPhone || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventType">문류</Label>
                      {isEditing ? (
                        <Select value={editData?.eventType || ""} onValueChange={(value) => setEditData({ ...editData, eventType: value })}>
                          <SelectTrigger id="eventType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concert">콘서트</SelectItem>
                            <SelectItem value="film">영상 제작</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-foreground">
                          {displayData.eventType === 'concert' ? '콘서트' : 
                           displayData.eventType === 'film' ? '영상 제작' : '기타'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: 행사 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">행사 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">행사명</Label>
                      {isEditing ? (
                        <Input
                          id="eventName"
                          value={editData?.eventName || ""}
                          onChange={(e) => setEditData({ ...editData, eventName: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.eventName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="venue">장소(공연장)</Label>
                      {isEditing ? (
                        <Input
                          id="venue"
                          value={editData?.venue || ""}
                          onChange={(e) => setEditData({ ...editData, venue: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.venue || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">날짜</Label>
                      {isEditing ? (
                        <Input
                          id="eventDate"
                          type="date"
                          value={editData?.eventDate ? new Date(editData.eventDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => setEditData({ ...editData, eventDate: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">
                          {displayData.eventDate ? new Date(displayData.eventDate).toLocaleDateString('ko-KR') : "-"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rehearsalTime">리허설시간</Label>
                      {isEditing ? (
                        <Input
                          id="rehearsalTime"
                          value={editData?.rehearsalTime || ""}
                          onChange={(e) => setEditData({ ...editData, rehearsalTime: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.rehearsalTime || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="composition">편성·인원</Label>
                      {isEditing ? (
                        <Input
                          id="composition"
                          value={editData?.composition || ""}
                          onChange={(e) => setEditData({ ...editData, composition: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.composition || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: 담당자 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">담당자 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">담당자 성함</Label>
                      {isEditing ? (
                        <Input
                          id="managerName"
                          value={editData?.managerName || ""}
                          onChange={(e) => setEditData({ ...editData, managerName: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.managerName || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="managerPhone">담당자 연락처</Label>
                      {isEditing ? (
                        <Input
                          id="managerPhone"
                          value={editData?.managerPhone || ""}
                          onChange={(e) => setEditData({ ...editData, managerPhone: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.managerPhone || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recordingStaff">녹음주자</Label>
                      {isEditing ? (
                        <Input
                          id="recordingStaff"
                          value={editData?.recordingStaff || ""}
                          onChange={(e) => setEditData({ ...editData, recordingStaff: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.recordingStaff || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photographyStaff">사진촬영 주자</Label>
                      {isEditing ? (
                        <Input
                          id="photographyStaff"
                          value={editData?.photographyStaff || ""}
                          onChange={(e) => setEditData({ ...editData, photographyStaff: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.photographyStaff || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audioSettings">촬영(녹음) 음선</Label>
                      {isEditing ? (
                        <Input
                          id="audioSettings"
                          value={editData?.audioSettings || ""}
                          onChange={(e) => setEditData({ ...editData, audioSettings: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.audioSettings || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectMonitor">프로젝트모니 주자</Label>
                      {isEditing ? (
                        <Input
                          id="projectMonitor"
                          value={editData?.projectMonitor || ""}
                          onChange={(e) => setEditData({ ...editData, projectMonitor: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{displayData.projectMonitor || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 4: 결제 정보 */}
                <div className="space-y-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">결제 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">결제방식</Label>
                      {isEditing ? (
                        <Select value={editData?.paymentMethod || ""} onValueChange={(value) => setEditData({ ...editData, paymentMethod: value })}>
                          <SelectTrigger id="paymentMethod">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">카드</SelectItem>
                            <SelectItem value="transfer">계좌이체</SelectItem>
                            <SelectItem value="cash">현금</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-foreground">
                          {displayData.paymentMethod === 'card' ? '카드' :
                           displayData.paymentMethod === 'transfer' ? '계좌이체' :
                           displayData.paymentMethod === 'cash' ? '현금' : '기타'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiptType">접수형태</Label>
                      {isEditing ? (
                        <Select value={editData?.receiptType || ""} onValueChange={(value) => setEditData({ ...editData, receiptType: value })}>
                          <SelectTrigger id="receiptType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">개인</SelectItem>
                            <SelectItem value="business">사업</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-foreground">
                          {displayData.receiptType === 'individual' ? '개인' :
                           displayData.receiptType === 'business' ? '사업' : '기타'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">결제된 금액</Label>
                      {isEditing ? (
                        <Input
                          id="paidAmount"
                          type="number"
                          value={editData?.paidAmount || 0}
                          onChange={(e) => setEditData({ ...editData, paidAmount: parseInt(e.target.value) })}
                        />
                      ) : (
                        <p className="text-foreground">{(displayData.paidAmount || 0).toLocaleString()}원</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unpaidAmount">미납 금액</Label>
                      {isEditing ? (
                        <Input
                          id="unpaidAmount"
                          type="number"
                          value={editData?.unpaidAmount || 0}
                          onChange={(e) => setEditData({ ...editData, unpaidAmount: parseInt(e.target.value) })}
                        />
                      ) : (
                        <p className="text-foreground">{(displayData.unpaidAmount || 0).toLocaleString()}원</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 5: 추가 정보 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">추가 정보</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">상태 {isAdmin && <span className="text-xs text-muted-foreground">(관리자만 수정 가능)</span>}</Label>
                    {isEditing && isAdmin ? (
                      <Select value={editData?.status || "pending"} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">접수대기</SelectItem>
                          <SelectItem value="confirmed">예약완료</SelectItem>
                          <SelectItem value="payment_completed">결제완료</SelectItem>
                          <SelectItem value="work_pending">작업대기</SelectItem>
                          <SelectItem value="in_progress">작업중</SelectItem>
                          <SelectItem value="editing">수정중</SelectItem>
                          <SelectItem value="completed">최종</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-foreground">
                        {displayData.status === 'pending' ? '접수대기' :
                         displayData.status === 'confirmed' ? '예약완료' :
                         displayData.status === 'payment_completed' ? '결제완료' :
                         displayData.status === 'work_pending' ? '작업대기' :
                         displayData.status === 'in_progress' ? '작업중' :
                         displayData.status === 'editing' ? '수정중' :
                         displayData.status === 'completed' ? '최종' :
                         displayData.status === 'cancelled' ? '취소' : displayData.status}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">비고</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={editData?.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={5}
                      />
                    ) : (
                      <p className="text-foreground whitespace-pre-wrap">{displayData.description || "-"}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
