import { useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
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
  
  const uploadFileMutation = trpc.upload.uploadFile.useMutation();

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

  const handleSave = async () => {
    if (!editData.eventName) {
      toast.error("행사명은 필수입니다.");
      return;
    }
    if (!reservation) {
      toast.error("예약 정보를 찾을 수 없습니다.");
      return;
    }
    
    // null 값을 undefined로 변환하고, undefined 값과 읽기 전용 필드 제거
    const readOnlyFields = ['id', 'createdAt', 'updatedAt'];
    
    console.log('[DEBUG] editData before cleaning:', editData);
    
    const cleanedData = Object.fromEntries(
      Object.entries(editData)
        .filter(([key, value]) => {
          const shouldKeep = !readOnlyFields.includes(key) && value !== undefined;
          console.log(`[DEBUG] Field ${key}: value=${value}, shouldKeep=${shouldKeep}`);
          return shouldKeep;
        })
        .map(([key, value]) => {
          const finalValue = value === null ? undefined : value;
          console.log(`[DEBUG] Mapping ${key}: ${value} -> ${finalValue}`);
          return [key, finalValue];
        })
    );
    
    console.log('[DEBUG] cleanedData:', cleanedData);
    
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'payment_completed':
        return 'bg-black text-white';
      case 'work_pending':
        return 'bg-sky-100 text-sky-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'editing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-black text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '접수대기';
      case 'confirmed':
        return '예약완료';
      case 'payment_completed':
        return '결제완료';
      case 'work_pending':
        return '작업대기';
      case 'in_progress':
        return '작업중';
      case 'editing':
        return '수정중';
      case 'completed':
        return '최종';
      case 'cancelled':
        return '취소';
      default:
        return status;
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
          <div className="space-y-4 pb-6 border-b-2 border-gray-300">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">
                {displayData.eventName || "제목 없음"}
              </h1>
              <span className={`px-4 py-2 rounded text-sm font-bold ${getStatusColor(displayData.status)}`}>
                {getStatusLabel(displayData.status)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              작성자: <span className="font-semibold text-foreground">{displayData.clientName}</span> | 작성일: <span className="font-semibold text-foreground">{new Date(displayData.createdAt).toLocaleDateString('ko-KR')}</span>
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Section 1: 기본 정보 */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-blue-900 mb-6">📋 기본 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded p-4 border border-blue-200">
                  <Label htmlFor="clientEmail" className="text-sm font-semibold text-gray-700">이메일</Label>
                  {isEditing ? (
                    <Input
                      id="clientEmail"
                      type="email"
                      value={editData?.clientEmail || ""}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, clientEmail: e.target.value }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.clientEmail}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-blue-200">
                  <Label htmlFor="clientName" className="text-sm font-semibold text-gray-700">담당자 성함</Label>
                  {isEditing ? (
                    <Input
                      id="clientName"
                      value={editData?.clientName || ""}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, clientName: e.target.value }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.clientName}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-blue-200">
                  <Label htmlFor="clientPhone" className="text-sm font-semibold text-gray-700">연락처</Label>
                  {isEditing ? (
                    <Input
                      id="clientPhone"
                      value={editData?.clientPhone || ""}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, clientPhone: e.target.value }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.clientPhone || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-blue-200">
                  <Label htmlFor="eventType" className="text-sm font-semibold text-gray-700">분류</Label>
                  {isEditing ? (
                    <Select value={editData?.eventType || ""} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, eventType: value }))}>
                      <SelectTrigger id="eventType" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">사진촬영</SelectItem>
                        <SelectItem value="concert">공연촬영</SelectItem>
                        <SelectItem value="video">영상제작</SelectItem>
                        <SelectItem value="music_video">뮤직비디오제작</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">
                      {displayData.eventType === 'photo' ? '사진촬영' : 
                       displayData.eventType === 'concert' ? '공연촬영' : 
                       displayData.eventType === 'video' ? '영상제작' : 
                       displayData.eventType === 'music_video' ? '뮤직비디오제작' : '기타'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: 행사 정보 */}
            <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-bold text-green-900 mb-6">🎬 행사 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded p-4 border border-green-200">
                  <Label htmlFor="eventName" className="text-sm font-semibold text-gray-700">행사명</Label>
                  {isEditing ? (
                    <Input
                      id="eventName"
                      value={editData?.eventName || ""}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, eventName: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.eventName}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-green-200">
                  <Label htmlFor="eventDate" className="text-sm font-semibold text-gray-700">행사일</Label>
                  {isEditing ? (
                    <Input
                      id="eventDate"
                      type="date"
                      value={editData?.eventDate ? new Date(editData.eventDate).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, eventDate: e.target.value ? new Date(e.target.value) : null }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">
                      {displayData.eventDate ? new Date(displayData.eventDate).toLocaleDateString('ko-KR') : "-"}
                    </p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-green-200">
                  <Label htmlFor="rehearsalTime" className="text-sm font-semibold text-gray-700">촬영 시간</Label>
                  {isEditing ? (
                    <Input
                      id="rehearsalTime"
                      type="time"
                      value={editData?.rehearsalTime || ""}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, rehearsalTime: e.target.value }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.rehearsalTime || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-green-200">
                  <Label htmlFor="venue" className="text-sm font-semibold text-gray-700">장소</Label>
                  {isEditing ? (
                    <Input
                      id="venue"
                      value={editData?.venue || ""}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, venue: e.target.value }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.venue || "-"}</p>
                  )}
                </div>


              </div>
            </div>

            {/* Section 3: 결제 정보 */}
            <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
              <h3 className="text-lg font-bold text-orange-900 mb-6">💰 결제 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label htmlFor="quotedAmount" className="text-sm font-semibold text-gray-700">견적액</Label>
                  {isEditing ? (
                    <Input
                      id="quotedAmount"
                      type="number"
                      value={editData?.quotedAmount || 0}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, quotedAmount: parseInt(e.target.value) || 0 }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{(displayData.quotedAmount || 0).toLocaleString()}원</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label htmlFor="paidAmount" className="text-sm font-semibold text-gray-700">결제액</Label>
                  {isEditing ? (
                    <Input
                      id="paidAmount"
                      type="number"
                      value={editData?.paidAmount || 0}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, paidAmount: parseInt(e.target.value) || 0 }))}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{(displayData.paidAmount || 0).toLocaleString()}원</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-orange-200">
                  <Label className="text-sm font-semibold text-gray-700">잔금</Label>
                  <p className="mt-2 text-foreground font-medium">{((displayData.quotedAmount || 0) - (displayData.paidAmount || 0)).toLocaleString()}원</p>
                </div>
              </div>
            </div>

            {/* Section 4: 촬영 정보 */}
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-bold text-purple-900 mb-6">🎥 촬영 정보</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded p-4 border border-purple-200">
                  <Label htmlFor="recordingType" className="text-sm font-semibold text-gray-700">촬영 유형</Label>
                  {isEditing ? (
                    <Select value={editData?.recordingType || ""} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, recordingType: value }))}>
                      <SelectTrigger id="recordingType" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="recording">Recording</SelectItem>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="special">영상제작</SelectItem>
                        <SelectItem value="editing">편집제작</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.recordingType || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-purple-200">
                  <Label htmlFor="paymentMethod" className="text-sm font-semibold text-gray-700">결제 방식</Label>
                  {isEditing ? (
                    <Select value={editData?.paymentMethod || ""} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, paymentMethod: value }))}>
                      <SelectTrigger id="paymentMethod" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">100% 선결제</SelectItem>
                        <SelectItem value="half">50% 선결제</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.paymentMethod || "-"}</p>
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-purple-200">
                  <Label htmlFor="specialRequirements" className="text-sm font-semibold text-gray-700">특수 요청</Label>
                  {isEditing ? (
                    <Select value={editData?.specialRequirements || ""} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, specialRequirements: value }))}>
                      <SelectTrigger id="specialRequirements" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speed">속도기</SelectItem>
                        <SelectItem value="steadycam">스테디캠</SelectItem>
                        <SelectItem value="drone">드론</SelectItem>
                        <SelectItem value="stabilizer">스태빌라이저</SelectItem>
                        <SelectItem value="crane">크레인</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-foreground font-medium">{displayData.specialRequirements || "-"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 5: 추가 정보 */}
            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-bold text-red-900 mb-6">📝 추가 정보</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded p-4 border border-red-200">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">상태 {isAdmin && <span className="text-xs text-red-600">(관리자만 수정 가능)</span>}</Label>
                  {isEditing && isAdmin ? (
                    <Select value={editData?.status || "pending"} onValueChange={(value) => setEditData((prev: any) => ({ ...prev, status: value }))}>
                      <SelectTrigger id="status" className="mt-2">
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
                    <p className="mt-2 text-foreground font-medium">
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

                <div className="bg-white rounded p-4 border border-red-200">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">프로그램 및 정보</Label>
                  {isEditing ? (
                    <div className="mt-2">
                      <RichTextEditor
                        content={editData?.description || ""}
                        onChange={(html) => setEditData((prev: any) => ({ ...prev, description: html }))}
                        placeholder="프로그램 및 정보를 입력하세요..."
                      />
                    </div>
                  ) : (
                    <div 
                      className="mt-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: displayData.description || "-" }}
                    />
                  )}
                </div>

                <div className="bg-white rounded p-4 border border-red-200">
                  <Label htmlFor="attachments" className="text-sm font-semibold text-gray-700">파일첨부</Label>
                  {isEditing ? (
                    <div className="mt-2">
                      <Input
                        id="attachments"
                        type="file"
                        multiple
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
                            const existingAttachments = editData?.attachments ? JSON.parse(editData.attachments) : [];
                            const newAttachments = [...existingAttachments, ...uploadedUrls];
                            setEditData((prev: any) => ({ ...prev, attachments: JSON.stringify(newAttachments) }));
                            toast.success(`${uploadedUrls.length}개 파일이 업로드되었습니다.`);
                          }
                        }}
                        className="cursor-pointer"
                      />
                      {editData?.attachments && (
                        <div className="mt-2 space-y-1">
                          {JSON.parse(editData.attachments).map((url: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                첨부파일 {index + 1}
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  const attachments = JSON.parse(editData.attachments);
                                  const newAttachments = attachments.filter((_: string, i: number) => i !== index);
                                  setEditData((prev: any) => ({ ...prev, attachments: newAttachments.length > 0 ? JSON.stringify(newAttachments) : null }));
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
                  ) : (
                    <div className="mt-2">
                      {displayData.attachments ? (
                        <div className="space-y-1">
                          {JSON.parse(displayData.attachments).map((url: string, index: number) => (
                            <div key={index}>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                첨부파일 {index + 1}
                              </a>
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
      </div>
    </div>
  );
}
