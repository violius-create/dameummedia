import { useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit2, Trash2, Loader2, Link2, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function ReservationDetail() {
  const [, params] = useRoute("/reservation/:id");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const uploadFileMutation = trpc.upload.uploadFile.useMutation();

  const id = params?.id ? parseInt(params.id) : null;

  const { data: reservation, isLoading, refetch } = trpc.reservations.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  // Load dynamic form labels
  const { data: labels } = trpc.reservationFormLabels.get.useQuery();

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

  const handleSave = async () => {
    if (!editData.eventName) {
      toast.error("행사명은 필수입니다.");
      return;
    }
    if (!reservation) {
      toast.error("예약 정보를 찾을 수 없습니다.");
      return;
    }
    
    const readOnlyFields = ['id', 'createdAt', 'updatedAt'];
    
    const cleanedData = Object.fromEntries(
      Object.entries(editData)
        .filter(([key, value]) => {
          return !readOnlyFields.includes(key) && value !== undefined;
        })
        .map(([key, value]) => {
          return [key, value === null ? undefined : value];
        })
    );
    
    await updateMutation.mutateAsync({
      id: reservation.id,
      data: cleanedData,
    });
  };

  const handleDelete = () => {
    if (!reservation) {
      toast.error("예약 정보를 찾을 수 없습니다.");
      return;
    }
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate({ id: reservation.id });
    }
  };

  // Dynamic labels
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
            <Link href="/reservation">
              <Button>게시판으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayData = isEditing && editData ? editData : reservation;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'payment_completed': return 'bg-black text-white';
      case 'work_pending': return 'bg-sky-100 text-sky-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'editing': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '접수대기';
      case 'confirmed': return '예약완료';
      case 'payment_completed': return '결제완료';
      case 'work_pending': return '작업대기';
      case 'in_progress': return '작업중';
      case 'editing': return '수정중';
      case 'completed': return '작업완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'photo': return '사진 촬영';
      case 'concert': return '공연 촬영';
      case 'video': return '영상 제작';
      case 'music_video': return '뮤직비디오 제작';
      case 'other': return '기타';
      default: return type;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card': return '카드';
      case 'transfer': return '계좌이체';
      case 'cash': return '현금';
      default: return method || '-';
    }
  };

  const getReceiptTypeLabel = (type: string) => {
    switch (type) {
      case 'issued': return '발행';
      case 'not_issued': return '미발행';
      case 'cash_receipt': return '간이영수증';
      default: return type || '-';
    }
  };

  // Check if linkUrl is valid
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

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
                  <Button size="sm" variant="outline" onClick={handleEdit} className="hover:text-neutral-400 transition-colors">
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                    저장
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditData(null); }}>
                    취소
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-8 sm:py-16">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b-2 border-gray-300">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-4xl font-bold text-foreground">
                {displayData.eventName || "제목 없음"}
              </h1>
              {isEditing && isAdmin ? (
                <Select value={editData?.status || "pending"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">접수대기</SelectItem>
                    <SelectItem value="confirmed">예약완료</SelectItem>
                    <SelectItem value="payment_completed">결제완료</SelectItem>
                    <SelectItem value="work_pending">작업대기</SelectItem>
                    <SelectItem value="in_progress">작업중</SelectItem>
                    <SelectItem value="editing">수정중</SelectItem>
                    <SelectItem value="completed">작업완료</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-bold whitespace-nowrap ${getStatusColor(displayData.status)}`}>
                  {getStatusLabel(displayData.status)}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              작성자: <span className="font-semibold text-foreground">{displayData.clientName}</span> | 작성일: <span className="font-semibold text-foreground">{new Date(displayData.createdAt).toLocaleDateString('ko-KR')}</span>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">

            {/* ===== 카테고리 1: 담당자 정보 ===== */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-sm sm:text-lg font-bold text-blue-900 mb-4 sm:mb-6 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">1</span>
                {l.cat1}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded p-4 border border-blue-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub1_1}</Label>
                  {isEditing ? (
                    <Input value={editData?.clientName || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, clientName: e.target.value }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium text-sm sm:text-base">{displayData.clientName}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-blue-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub1_2}</Label>
                  {isEditing ? (
                    <Input value={editData?.clientPhone || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, clientPhone: e.target.value }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium text-sm sm:text-base">{displayData.clientPhone || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-blue-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub1_3}</Label>
                  {isEditing ? (
                    <Input type="email" value={editData?.clientEmail || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, clientEmail: e.target.value }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium text-sm sm:text-base">{displayData.clientEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== 카테고리 2: 행사 정보 ===== */}
            <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="text-sm sm:text-lg font-bold text-green-900 mb-4 sm:mb-6 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">2</span>
                {l.cat2}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-4 border border-green-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub2_1}</Label>
                  {isEditing ? (
                    <Input value={editData?.eventName || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, eventName: e.target.value }))} className="mt-2" required />
                  ) : (
                    <p className="mt-2 text-foreground font-medium text-sm sm:text-base">{displayData.eventName}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-green-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub2_2}</Label>
                  {isEditing ? (
                    <Input value={editData?.venue || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, venue: e.target.value }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium text-sm sm:text-base">{displayData.venue || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-green-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub2_3}</Label>
                  {isEditing ? (
                    <Input type="date" value={editData?.eventDate ? new Date(editData.eventDate).toISOString().split('T')[0] : ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, eventDate: e.target.value ? new Date(e.target.value) : null }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.eventDate ? new Date(displayData.eventDate).toLocaleDateString('ko-KR') : "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-green-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub2_4}</Label>
                  {isEditing ? (
                    <Input type="time" value={editData?.startTime || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, startTime: e.target.value }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.startTime || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-green-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub2_5}</Label>
                  {isEditing ? (
                    <Input value={editData?.rehearsalTime || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, rehearsalTime: e.target.value }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.rehearsalTime || "-"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== 카테고리 3: 작업 내용 ===== */}
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-sm sm:text-lg font-bold text-purple-900 mb-4 sm:mb-6 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">3</span>
                {l.cat3}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-4 border border-purple-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub3_1}</Label>
                  {isEditing ? (
                    <Select value={editData?.eventType || ""} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, eventType: value }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">사진 촬영</SelectItem>
                        <SelectItem value="concert">공연 촬영</SelectItem>
                        <SelectItem value="video">영상 제작</SelectItem>
                        <SelectItem value="music_video">뮤직비디오 제작</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{getEventTypeLabel(displayData.eventType)}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-purple-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub3_2}</Label>
                  {isEditing ? (
                    <Select value={editData?.recordingType || ""} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, recordingType: value }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Photo">Photo</SelectItem>
                        <SelectItem value="Solo">Solo</SelectItem>
                        <SelectItem value="Recording">Recording</SelectItem>
                        <SelectItem value="Simple">Simple</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.recordingType || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-purple-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub3_3}</Label>
                  {isEditing ? (
                    <Input value={editData?.specialRequirements || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, specialRequirements: e.target.value }))} className="mt-2" placeholder="드론, 짐벌, 지미집, 기타" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.specialRequirements || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-purple-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub3_4}</Label>
                  {isEditing ? (
                    <Select value={String(editData?.isPublic ?? 1)} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, isPublic: parseInt(value) }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">허용</SelectItem>
                        <SelectItem value="0">불허</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.isPublic === 1 ? "허용" : "불허"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== 카테고리 4: 결제 정보 ===== */}
            <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
              <h3 className="text-sm sm:text-lg font-bold text-orange-900 mb-4 sm:mb-6 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">4</span>
                {l.cat4}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub4_1}</Label>
                  {isEditing ? (
                    <Select value={editData?.paymentMethod || "card"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, paymentMethod: value }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">카드</SelectItem>
                        <SelectItem value="transfer">계좌이체</SelectItem>
                        <SelectItem value="cash">현금</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{getPaymentMethodLabel(displayData.paymentMethod)}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub4_2}</Label>
                  {isEditing ? (
                    <Select value={editData?.receiptType || "issued"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, receiptType: value }))}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="issued">발행</SelectItem>
                        <SelectItem value="not_issued">미발행</SelectItem>
                        <SelectItem value="cash_receipt">간이영수증</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{getReceiptTypeLabel(displayData.receiptType)}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub4_3} {isAdmin && <span className="text-xs text-red-600">(관리자 전용)</span>}</Label>
                  {isEditing && isAdmin ? (
                    <Input type="number" value={editData?.quotedAmount || 0} onChange={(e) => setEditData((prev: any) => ({ ...prev, quotedAmount: parseInt(e.target.value) || 0 }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{(displayData.quotedAmount || 0).toLocaleString()}원</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub4_4} {isAdmin && <span className="text-xs text-red-600">(관리자 전용)</span>}</Label>
                  {isEditing && isAdmin ? (
                    <Input type="number" value={editData?.paidAmount || 0} onChange={(e) => setEditData((prev: any) => ({ ...prev, paidAmount: parseInt(e.target.value) || 0 }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{(displayData.paidAmount || 0).toLocaleString()}원</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">{l.sub4_5} {isAdmin && <span className="text-xs text-red-600">(관리자 전용)</span>}</Label>
                  {isEditing && isAdmin ? (
                    <Input type="number" value={editData?.unpaidAmount || 0} onChange={(e) => setEditData((prev: any) => ({ ...prev, unpaidAmount: parseInt(e.target.value) || 0 }))} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{(displayData.unpaidAmount || 0).toLocaleString()}원</p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== 카테고리 5: 프로그램 및 요청사항 ===== */}
            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-sm sm:text-lg font-bold text-red-900 mb-4 sm:mb-6 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">5</span>
                {l.cat5}
              </h3>
              
              <div className="bg-white rounded p-4 border border-red-200">
                {isEditing ? (
                  <RichTextEditor
                    content={editData?.description || ""}
                    onChange={(html) => setEditData((prev: any) => ({ ...prev, description: html }))}
                    placeholder="프로그램 내용이나 추가 요청사항을 입력하세요..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: displayData.description || "-" }} />
                )}
              </div>

              {/* 링크 첨부 - content 영역에 표시 */}
              {isValidUrl(displayData.linkUrl) && !isEditing && (
                <div className="mt-4 bg-white rounded p-4 border border-red-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    링크 첨부
                  </Label>
                  <a href={displayData.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:underline text-sm sm:text-base break-all">
                    {displayData.linkUrl}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              )}

              {isEditing && (
                <div className="mt-4 bg-white rounded p-4 border border-red-200">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    링크 첨부
                  </Label>
                  <Input type="url" value={editData?.linkUrl || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, linkUrl: e.target.value }))} className="mt-2" placeholder="https://..." />
                </div>
              )}
            </div>

            {/* ===== 파일 첨부 ===== */}
            <div className="bg-white rounded p-4 border-2 border-dashed border-blue-400 bg-blue-50">
              <Label className="text-xs sm:text-sm font-semibold text-blue-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                파일첨부
              </Label>
              {isEditing ? (
                <div className="mt-2">
                  <Input
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
                              const result = await uploadFileMutation.mutateAsync({ fileName: file.name, fileData, mimeType: file.type });
                              uploadedUrls.push(result.url);
                              resolve(null);
                            } catch (error) {
                              toast.error(`파일 업로드 실패: ${file.name}`);
                              resolve(null);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                      if (uploadedUrls.length > 0) {
                        const existingAttachments = editData?.attachments ? JSON.parse(editData.attachments) : [];
                        const newAttachments = [...existingAttachments, ...uploadedUrls];
                        setEditData((prev: any) => ({ ...prev, attachments: JSON.stringify(newAttachments) }));
                        toast.success(`${uploadedUrls.length}개 파일이 업로드되었습니다.`);
                      }
                    }}
                  />
                  {editData?.attachments && (
                    <div className="mt-2 space-y-1">
                      {JSON.parse(editData.attachments).map((url: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">첨부파일 {index + 1}</a>
                          <button type="button" onClick={() => {
                            const attachments = JSON.parse(editData.attachments);
                            const newAttachments = attachments.filter((_: string, i: number) => i !== index);
                            setEditData((prev: any) => ({ ...prev, attachments: newAttachments.length > 0 ? JSON.stringify(newAttachments) : null }));
                          }} className="text-red-600 hover:text-red-800 text-xs">삭제</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  {displayData.attachments ? (
                    <div className="space-y-1">
                      {JSON.parse(displayData.attachments).map((url: string, index: number) => (
                        <div key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">첨부파일 {index + 1}</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-foreground">-</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
