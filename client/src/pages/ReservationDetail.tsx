import { useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit2, Trash2, Loader2, Link2, ExternalLink, Upload, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useMemo, useCallback, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Move helper components OUTSIDE the main component to prevent DOM replacement on re-render
const InfoRow = ({ label, value, labelColor = "text-muted-foreground" }: { label: string; value: React.ReactNode; labelColor?: string }) => (
  <div className="flex items-baseline gap-3 py-2 border-b border-gray-100 last:border-b-0">
    <span className={`text-xs sm:text-sm font-semibold ${labelColor} whitespace-nowrap min-w-[80px] sm:min-w-[120px]`}>{label}</span>
    <span className="text-sm sm:text-base text-foreground font-medium flex-1">{value || "-"}</span>
  </div>
);

const EditRow = ({ label, children, labelColor = "text-muted-foreground" }: { label: string; children: React.ReactNode; labelColor?: string }) => (
  <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
    <span className={`text-xs sm:text-sm font-semibold ${labelColor} whitespace-nowrap min-w-[80px] sm:min-w-[120px]`}>{label}</span>
    <div className="flex-1">{children}</div>
  </div>
);

// Isolated amount input component to prevent parent re-renders from destroying the input DOM
const AmountInput = memo(({ initialValue, onValueChange, placeholder }: { initialValue: string; onValueChange: (val: string) => void; placeholder: string }) => {
  const [localValue, setLocalValue] = useState(initialValue);
  return (
    <Input
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onValueChange(e.target.value);
      }}
      placeholder={placeholder}
    />
  );
});
AmountInput.displayName = 'AmountInput';

export default function ReservationDetail() {
  const [, params] = useRoute("/reservation/:id");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [quotedAmountStr, setQuotedAmountStr] = useState('');
  const [paidAmountStr, setPaidAmountStr] = useState('');
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

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [guestPasswordInput, setGuestPasswordInput] = useState('');
  const [verifiedGuestPassword, setVerifiedGuestPassword] = useState<string | null>(null);

  const verifyPasswordMutation = trpc.reservations.verifyPassword.useMutation({
    onSuccess: () => {
      setVerifiedGuestPassword(guestPasswordInput);
      setShowPasswordDialog(false);
      setGuestPasswordInput('');
      // Now enter edit mode
      setEditData({ ...reservation });
      setQuotedAmountStr(String(reservation?.quotedAmount ?? ''));
      setPaidAmountStr(String(reservation?.paidAmount ?? ''));
      setIsEditing(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = () => {
    // Admin or owner (logged-in user who created the reservation) can edit directly
    if (isAdmin || (user && reservation?.userId && user.id === reservation.userId)) {
      setEditData({ ...reservation });
      setQuotedAmountStr(String(reservation?.quotedAmount ?? ''));
      setPaidAmountStr(String(reservation?.paidAmount ?? ''));
      setIsEditing(true);
      return;
    }
    
    // If reservation has a guest password, show password dialog
    if (reservation?.guestPassword) {
      setShowPasswordDialog(true);
      return;
    }
    
    // No password set and not owner - still allow edit (legacy reservations without password)
    setEditData({ ...reservation });
    setQuotedAmountStr(String(reservation?.quotedAmount ?? ''));
    setPaidAmountStr(String(reservation?.paidAmount ?? ''));
    setIsEditing(true);
  };

  const handleVerifyPassword = () => {
    if (!guestPasswordInput.trim()) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }
    if (!id) return;
    verifyPasswordMutation.mutate({ id, password: guestPasswordInput });
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

    // Sync amount string states back to editData before saving
    editData.quotedAmount = quotedAmountStr === '' ? 0 : parseInt(quotedAmountStr.replace(/[^0-9]/g, '')) || 0;
    editData.paidAmount = paidAmountStr === '' ? 0 : parseInt(paidAmountStr.replace(/[^0-9]/g, '')) || 0;

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
      guestPassword: verifiedGuestPassword || undefined,
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
    sub4_6: labels?.sub4_6Label || "진행상황",
  };

  // Progress status options from labels
  const progressOptions = useMemo(() => [
    labels?.progressOption1 || "접수중",
    labels?.progressOption2 || "예약완료",
    labels?.progressOption3 || "준비중",
    labels?.progressOption4 || "작업중",
    labels?.progressOption5 || "작업완료",
    labels?.progressOption6 || "취소",
  ], [labels]);

  // Radio/checkbox option labels from DB
  const eventTypeOptions = useMemo(() => [
    { value: "photo", label: labels?.eventTypeOption1 || "사진 촬영" },
    { value: "concert", label: labels?.eventTypeOption2 || "공연 촬영" },
    { value: "video", label: labels?.eventTypeOption3 || "영상 제작" },
    { value: "music_video", label: labels?.eventTypeOption4 || "뮤직비디오 제작" },
    { value: "other", label: labels?.eventTypeOption5 || "기타" },
  ], [labels]);
  const recordingTypeOptions = useMemo(() => [
    labels?.recordingTypeOption1 || "Photo",
    labels?.recordingTypeOption2 || "Solo",
    labels?.recordingTypeOption3 || "Recording",
    labels?.recordingTypeOption4 || "Simple",
    labels?.recordingTypeOption5 || "Basic",
    labels?.recordingTypeOption6 || "Professional",
  ], [labels]);
  const specialReqOptions = useMemo(() => [
    labels?.specialReqOption1 || "드론",
    labels?.specialReqOption2 || "짐벌",
    labels?.specialReqOption3 || "지미집",
    labels?.specialReqOption4 || "기타",
  ], [labels]);
  const isPublicOptionLabels = useMemo(() => ({
    "1": labels?.isPublicOption1 || "허용",
    "0": labels?.isPublicOption2 || "불허",
  }), [labels]);
  const paymentMethodOptionLabels = useMemo(() => ({
    card: labels?.paymentMethodOption1 || "카드",
    transfer: labels?.paymentMethodOption2 || "계좌이체",
    cash: labels?.paymentMethodOption3 || "현금",
  }), [labels]);
  const receiptTypeOptionLabels = useMemo(() => ({
    issued: labels?.receiptTypeOption1 || "발행",
    not_issued: labels?.receiptTypeOption2 || "미발행",
    cash_receipt: labels?.receiptTypeOption3 || "간이영수증",
  }), [labels]);

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

  // Auto-calculate unpaid amount
  const calculatedUnpaid = (displayData.quotedAmount || 0) - (displayData.paidAmount || 0);

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
    const found = eventTypeOptions.find(o => o.value === type);
    return found ? found.label : type;
  };

  const getPaymentMethodLabel = (method: string) => {
    return (paymentMethodOptionLabels as any)[method] || method || '-';
  };

  const getReceiptTypeLabel = (type: string) => {
    return (receiptTypeOptionLabels as any)[type] || type || '-';
  };

  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Check if a URL is an image
  const isImageUrl = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  // Parse attachments
  const attachments: string[] = displayData.attachments ? (() => {
    try { return JSON.parse(displayData.attachments); } catch { return []; }
  })() : [];

  const imageAttachments = attachments.filter(isImageUrl);
  const fileAttachments = attachments.filter(url => !isImageUrl(url));

  //   // InfoRow and EditRow are now defined outside the component to prevent DOM replacement);

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
                    {isAdmin && (
                      <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </Button>
                    )}
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
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b-2 border-gray-300">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-4xl font-bold text-foreground">
                {displayData.eventName || "제목 없음"}
              </h1>
              {
                (() => {
                  const progressVal = displayData.progressStatus || '접수중';
                  const pColor = progressVal === '취소' ? 'bg-gray-400 text-white' :
                    progressVal === '작업완료' ? 'bg-red-100 text-red-800' :
                    progressVal === '작업중' ? 'bg-blue-100 text-blue-800' :
                    progressVal === '준비중' ? 'bg-sky-100 text-sky-800' :
                    progressVal === '예약완료' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800';
                  return (
                    <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-bold whitespace-nowrap ${pColor}`}>
                      {progressVal}
                    </span>
                  );
                })()
              }
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              작성자: <span className="font-semibold text-foreground">{displayData.clientName}</span> | 작성일: <span className="font-semibold text-foreground">{new Date(displayData.createdAt).toLocaleDateString('ko-KR')}</span>
            </p>
          </div>

          {/* Image attachments inline display */}
          {!isEditing && imageAttachments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">첨부 이미지</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageAttachments.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-border hover:shadow-lg transition-shadow">
                    <img src={url} alt={`첨부 이미지 ${index + 1}`} className="w-full h-auto object-cover" loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-6">

            {/* ===== 카테고리 1: 담당자 정보 ===== */}
            <div className="rounded-lg border border-blue-200 overflow-hidden">
              <div className="bg-blue-50 px-4 sm:px-6 py-3 border-b border-blue-200">
                <h3 className="text-sm sm:text-base font-bold text-blue-800 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs font-bold">1</span>
                  {l.cat1}
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-3 bg-white">
                {isEditing ? (
                  <div className="space-y-0">
                    <EditRow label={l.sub1_1} labelColor="text-blue-700">
                      <Input value={editData?.clientName || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, clientName: e.target.value }))} />
                    </EditRow>
                    <EditRow label={l.sub1_2} labelColor="text-blue-700">
                      <Input value={editData?.clientPhone || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, clientPhone: e.target.value }))} />
                    </EditRow>

                  </div>
                ) : (
                  <div className="space-y-0">
                    <InfoRow label={l.sub1_1} value={displayData.clientName} labelColor="text-blue-700" />
                    <InfoRow label={l.sub1_2} value={displayData.clientPhone} labelColor="text-blue-700" />

                  </div>
                )}
              </div>
            </div>

            {/* ===== 카테고리 2: 행사 정보 ===== */}
            <div className="rounded-lg border border-green-200 overflow-hidden">
              <div className="bg-green-50 px-4 sm:px-6 py-3 border-b border-green-200">
                <h3 className="text-sm sm:text-base font-bold text-green-800 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-xs font-bold">2</span>
                  {l.cat2}
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-3 bg-white">
                {isEditing ? (
                  <div className="space-y-0">
                    <EditRow label={l.sub2_1} labelColor="text-green-700">
                      <Input value={editData?.eventName || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, eventName: e.target.value }))} required />
                    </EditRow>
                    <EditRow label={l.sub2_2} labelColor="text-green-700">
                      <Input value={editData?.venue || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, venue: e.target.value }))} />
                    </EditRow>
                    <EditRow label={l.sub2_3} labelColor="text-green-700">
                      <Input type="date" value={editData?.eventDate ? new Date(editData.eventDate).toISOString().split('T')[0] : ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, eventDate: e.target.value ? new Date(e.target.value) : null }))} />
                    </EditRow>
                    <EditRow label={l.sub2_4} labelColor="text-green-700">
                      <Input type="time" value={editData?.startTime || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, startTime: e.target.value }))} />
                    </EditRow>
                    <EditRow label={l.sub2_5} labelColor="text-green-700">
                      <Input value={editData?.rehearsalTime || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, rehearsalTime: e.target.value }))} />
                    </EditRow>
                  </div>
                ) : (
                  <div className="space-y-0">
                    <InfoRow label={l.sub2_1} value={displayData.eventName} labelColor="text-green-700" />
                    <InfoRow label={l.sub2_2} value={displayData.venue} labelColor="text-green-700" />
                    <InfoRow label={l.sub2_3} value={displayData.eventDate ? new Date(displayData.eventDate).toLocaleDateString('ko-KR') : null} labelColor="text-green-700" />
                    <InfoRow label={l.sub2_4} value={displayData.startTime} labelColor="text-green-700" />
                    <InfoRow label={l.sub2_5} value={displayData.rehearsalTime} labelColor="text-green-700" />
                  </div>
                )}
              </div>
            </div>

            {/* ===== 카테고리 3: 작업 내용 ===== */}
            <div className="rounded-lg border border-purple-200 overflow-hidden">
              <div className="bg-purple-50 px-4 sm:px-6 py-3 border-b border-purple-200">
                <h3 className="text-sm sm:text-base font-bold text-purple-800 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 text-white text-xs font-bold">3</span>
                  {l.cat3}
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-3 bg-white">
                {isEditing ? (
                  <div className="space-y-0">
                    <EditRow label={l.sub3_1} labelColor="text-purple-700">
                      <Select value={editData?.eventType || "photo"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, eventType: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {eventTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EditRow>
                    <EditRow label={l.sub3_2} labelColor="text-purple-700">
                      <Select value={editData?.recordingType || recordingTypeOptions[0]} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, recordingType: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {recordingTypeOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EditRow>
                    {/* 특수 요청 - 체크박스 */}
                    <EditRow label={l.sub3_3} labelColor="text-purple-700">
                      <div className="flex flex-wrap gap-3">
                        {specialReqOptions.map((opt) => {
                          const currentReqs = editData?.specialRequirements ? editData.specialRequirements.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
                          const isChecked = currentReqs.includes(opt);
                          return (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const newReqs = isChecked
                                    ? currentReqs.filter((r: string) => r !== opt)
                                    : [...currentReqs, opt];
                                  setEditData((prev: any) => ({ ...prev, specialRequirements: newReqs.join(", ") }));
                                }}
                                className="w-4 h-4 accent-purple-600"
                              />
                              <span className="text-sm">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </EditRow>
                    <EditRow label={l.sub3_4} labelColor="text-purple-700">
                      <Select value={String(editData?.isPublic ?? 1)} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, isPublic: parseInt(value) }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(isPublicOptionLabels).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EditRow>
                  </div>
                ) : (
                  <div className="space-y-0">
                    <InfoRow label={l.sub3_1} value={getEventTypeLabel(displayData.eventType)} labelColor="text-purple-700" />
                    <InfoRow label={l.sub3_2} value={displayData.recordingType} labelColor="text-purple-700" />
                    <InfoRow label={l.sub3_3} value={displayData.specialRequirements} labelColor="text-purple-700" />
                    <InfoRow label={l.sub3_4} value={isPublicOptionLabels[String(displayData.isPublic) as "1" | "0"]} labelColor="text-purple-700" />
                  </div>
                )}
              </div>
            </div>

            {/* ===== 카테고리 4: 결제 정보 ===== */}
            <div className="rounded-lg border border-orange-200 overflow-hidden">
              <div className="bg-orange-50 px-4 sm:px-6 py-3 border-b border-orange-200">
                <h3 className="text-sm sm:text-base font-bold text-orange-800 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500 text-white text-xs font-bold">4</span>
                  {l.cat4}
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-3 bg-white">
                {isEditing ? (
                  <div className="space-y-0">
                    <EditRow label={l.sub4_1} labelColor="text-orange-700">
                      <Select value={editData?.paymentMethod || "card"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentMethodOptionLabels).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EditRow>
                    <EditRow label={l.sub4_2} labelColor="text-orange-700">
                      <Select value={editData?.receiptType || "issued"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, receiptType: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(receiptTypeOptionLabels).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EditRow>
                    {/* 진행상황 - 관리자만 수정 */}
                    <EditRow label={l.sub4_6} labelColor="text-orange-700">
                      {isAdmin ? (
                        <Select value={editData?.progressStatus || "receiving"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, progressStatus: value }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {progressOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-foreground">{editData?.progressStatus || "접수중"}</span>
                      )}
                    </EditRow>
                    {/* 금액 - 관리자만 수정 */}
                    {isAdmin ? (
                      <>
                        <EditRow label={`${l.sub4_3} ⚙`} labelColor="text-orange-700">
                          <AmountInput
                            key="quoted-amount"
                            initialValue={quotedAmountStr}
                            onValueChange={setQuotedAmountStr}
                            placeholder="숫자 입력"
                          />
                        </EditRow>
                        <EditRow label={`${l.sub4_4} ⚙`} labelColor="text-orange-700">
                          <AmountInput
                            key="paid-amount"
                            initialValue={paidAmountStr}
                            onValueChange={setPaidAmountStr}
                            placeholder="숫자 입력"
                          />
                        </EditRow>
                        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                          <span className="text-xs sm:text-sm font-semibold text-orange-700 whitespace-nowrap min-w-[80px] sm:min-w-[120px]">{l.sub4_5}</span>
                          <span className="text-sm sm:text-base text-red-600 font-bold flex-1">
                            {((parseInt(quotedAmountStr.replace(/[^0-9]/g, '')) || 0) - (parseInt(paidAmountStr.replace(/[^0-9]/g, '')) || 0)).toLocaleString()}원 (자동계산)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoRow label={l.sub4_3} value={`${(displayData.quotedAmount || 0).toLocaleString()}원`} labelColor="text-orange-700" />
                        <InfoRow label={l.sub4_4} value={`${(displayData.paidAmount || 0).toLocaleString()}원`} labelColor="text-orange-700" />
                        <InfoRow label={l.sub4_5} value={<span className="text-red-600 font-bold">{calculatedUnpaid.toLocaleString()}원</span>} labelColor="text-orange-700" />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-0">
                    <InfoRow label={l.sub4_1} value={getPaymentMethodLabel(displayData.paymentMethod)} labelColor="text-orange-700" />
                    <InfoRow label={l.sub4_2} value={getReceiptTypeLabel(displayData.receiptType)} labelColor="text-orange-700" />
                    <InfoRow label={l.sub4_6} value={
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        displayData.progressStatus === "취소" ? "bg-red-100 text-red-800" :
                        displayData.progressStatus === "작업완료" ? "bg-green-100 text-green-800" :
                        displayData.progressStatus === "작업중" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {displayData.progressStatus || "접수중"}
                      </span>
                    } labelColor="text-orange-700" />
                    <InfoRow label={l.sub4_3} value={`${(displayData.quotedAmount || 0).toLocaleString()}원`} labelColor="text-orange-700" />
                    <InfoRow label={l.sub4_4} value={`${(displayData.paidAmount || 0).toLocaleString()}원`} labelColor="text-orange-700" />
                    <InfoRow label={l.sub4_5} value={
                      <span className={`font-bold ${calculatedUnpaid > 0 ? "text-red-600" : "text-green-600"}`}>
                        {calculatedUnpaid.toLocaleString()}원
                      </span>
                    } labelColor="text-orange-700" />
                  </div>
                )}
              </div>
            </div>

            {/* ===== 카테고리 5: 프로그램 및 요청사항 ===== */}
            <div className="rounded-lg border border-red-200 overflow-hidden">
              <div className="bg-red-50 px-4 sm:px-6 py-3 border-b border-red-200">
                <h3 className="text-sm sm:text-base font-bold text-red-800 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 text-white text-xs font-bold">5</span>
                  {l.cat5}
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-4 bg-white">
                {isEditing ? (
                  <RichTextEditor
                    content={editData?.description || ""}
                    onChange={(html) => setEditData((prev: any) => ({ ...prev, description: html }))}
                    placeholder="프로그램 내용이나 추가 요청사항을 입력하세요..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: displayData.description || "-" }} />
                )}

                {/* 링크 첨부 - content 영역에 표시 */}
                {isValidUrl(displayData.linkUrl) && !isEditing && (
                  <div className="mt-4 pt-4 border-t border-red-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Link2 className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-700">링크 첨부:</span>
                      <a href={displayData.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all flex items-center gap-1">
                        {displayData.linkUrl}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-red-100">
                    <EditRow label="링크 첨부" labelColor="text-red-700">
                      <Input type="url" value={editData?.linkUrl || ""} onChange={(e) => setEditData((prev: any) => ({ ...prev, linkUrl: e.target.value }))} placeholder="https://..." />
                    </EditRow>
                  </div>
                )}
              </div>
            </div>

            {/* ===== 파일 첨부 ===== */}
            <div className="rounded-lg border-2 border-dashed border-blue-300 overflow-hidden">
              <div className="bg-blue-50 px-4 sm:px-6 py-3 border-b border-blue-200">
                <h3 className="text-sm sm:text-base font-bold text-blue-800 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  파일 첨부
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-4 bg-white">
                {isEditing ? (
                  <div>
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
                      <div className="mt-3 space-y-1">
                        {JSON.parse(editData.attachments).map((url: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">첨부파일 {index + 1}</a>
                            <button type="button" onClick={() => {
                              const atts = JSON.parse(editData.attachments);
                              const newAtts = atts.filter((_: string, i: number) => i !== index);
                              setEditData((prev: any) => ({ ...prev, attachments: newAtts.length > 0 ? JSON.stringify(newAtts) : null }));
                            }} className="text-red-600 hover:text-red-800 text-xs">삭제</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {fileAttachments.length > 0 ? (
                      <div className="space-y-1">
                        {fileAttachments.map((url, index) => (
                          <div key={index}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              첨부파일 {index + 1}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : imageAttachments.length === 0 ? (
                      <p className="text-muted-foreground text-sm">-</p>
                    ) : (
                      <p className="text-muted-foreground text-sm">이미지 파일은 상단에 표시됩니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password verification dialog for guest users */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              비밀번호 확인
            </DialogTitle>
            <DialogDescription>
              예약 작성 시 설정한 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={guestPasswordInput}
              onChange={(e) => setGuestPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerifyPassword();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPasswordDialog(false); setGuestPasswordInput(''); }}>
              취소
            </Button>
            <Button onClick={handleVerifyPassword} disabled={verifyPasswordMutation.isPending}>
              {verifyPasswordMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 확인 중...</>
              ) : '확인'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
