import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Plus, Search, Loader2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ReservationBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // 게시판 레이아웃 설정에서 페이지당 게시물 수 가져오기
  const { data: boardSettings } = trpc.boardLayoutSettings.get.useQuery({ boardKey: 'reservation' });
  const pageSize = boardSettings?.itemsPerPage || 10;

  // 예약 목록 조회
  const { data: reservations = [], isLoading, refetch } = trpc.reservations.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  // 섹션 제목 데이터 로드
  const { data: sectionData } = trpc.sectionTitles.get.useQuery({ sectionKey: 'reservation' });

  // 일괄 삭제 mutation
  const bulkDeleteMutation = trpc.reservations.bulkDelete.useMutation({
    onSuccess: () => {
      toast.success(`${selectedIds.length}건의 예약이 삭제되었습니다.`);
      setSelectedIds([]);
      refetch();
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const getProgressLabel = (status: string | null | undefined) => {
    if (!status) return '접수중';
    return status;
  };

  const getProgressColor = (status: string | null | undefined) => {
    switch (status) {
      case '접수중': return 'bg-yellow-100 text-yellow-800';
      case '예약완료': return 'bg-green-100 text-green-800';
      case '준비중': return 'bg-sky-100 text-sky-800';
      case '작업중': return 'bg-blue-100 text-blue-800';
      case '작업완료': return 'bg-red-100 text-red-800';
      case '취소': return 'bg-gray-400 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredReservations = reservations.filter((res: any) => 
    res.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReservations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReservations.map((r: any) => r.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`선택한 ${selectedIds.length}건의 예약을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setIsDeleting(true);
    bulkDeleteMutation.mutate({ ids: selectedIds });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                HOME
              </Button>
            </Link>
            <Link href="/reservation/new">
              <Button size="sm" className="bg-primary text-white">
                <Plus className="mr-2 h-4 w-4" />
                새 예약
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground">{sectionData?.title || '예약 게시판'}</h1>
            <p className="text-sm sm:text-lg text-muted-foreground">
              {sectionData?.description || ''}
            </p>
          </div>

          {/* Search + Admin Actions */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder="예약명, 담당자명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {isAdmin && selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex-shrink-0"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {selectedIds.length}건 삭제
              </Button>
            )}
          </div>

          {/* Reservations Table */}
          {filteredReservations && filteredReservations.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
              {/* Table Header - hidden on mobile */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 md:px-6 py-4 hidden md:block">
                <div className="flex gap-4 items-center text-sm font-semibold text-foreground">
                  {isAdmin && (
                    <div className="w-[4%] flex justify-center">
                      <Checkbox
                        checked={selectedIds.length === filteredReservations.length && filteredReservations.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </div>
                  )}
                  <div className={isAdmin ? "w-[5%]" : "w-[6%]"}>번호</div>
                  <div className={isAdmin ? "w-[41%]" : "w-[44%]"}>행사명</div>
                  <div className="w-[14%]">작성자</div>
                  <div className="w-[16%]">날짜</div>
                  <div className="w-[20%] text-center">진행상황</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredReservations.map((reservation: any, index: number) => (
                  <div
                    key={reservation.id}
                    className={`hover:bg-gray-200 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    } ${selectedIds.includes(reservation.id) ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                  >
                    {/* Desktop layout */}
                    <div className="hidden md:flex px-6 py-4 gap-4 items-center text-sm">
                      {isAdmin && (
                        <div className="w-[4%] flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.includes(reservation.id)}
                            onCheckedChange={() => toggleSelect(reservation.id)}
                          />
                        </div>
                      )}
                      <div className={`${isAdmin ? "w-[5%]" : "w-[6%]"} text-foreground font-medium`}>
                        {reservation.id}
                      </div>
                      <Link href={`/reservation/${reservation.id}`} className={`${isAdmin ? "w-[41%]" : "w-[44%]"} text-primary hover:underline truncate cursor-pointer`}>
                        {reservation.eventName || "제목 없음"}
                      </Link>
                      <div className="w-[14%] text-foreground">
                        {reservation.clientName || "-"}
                      </div>
                      <div className="w-[16%] text-muted-foreground">
                        {reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('ko-KR') : "-"}
                      </div>
                      <div className="w-[20%] flex justify-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getProgressColor(reservation.progressStatus)}`}>
                          {getProgressLabel(reservation.progressStatus)}
                        </span>
                      </div>
                    </div>
                    {/* Mobile layout */}
                    <div className="md:hidden px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                            <Checkbox
                              checked={selectedIds.includes(reservation.id)}
                              onCheckedChange={() => toggleSelect(reservation.id)}
                            />
                          </div>
                        )}
                        <Link href={`/reservation/${reservation.id}`} className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-xs sm:text-sm font-medium text-primary truncate flex-1 min-w-0">
                              {reservation.eventName || "제목 없음"}
                            </h3>
                            <div className="flex gap-1 flex-shrink-0">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${getProgressColor(reservation.progressStatus)}`}>
                                {getProgressLabel(reservation.progressStatus)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                            <span>{reservation.clientName || "-"}</span>
                            <span>·</span>
                            <span>{reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('ko-KR') : "-"}</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "검색 결과가 없습니다." : "예약이 없습니다."}
              </p>
              <Link href="/reservation/new">
                <Button className="bg-primary text-white">
                  새 예약 작성하기
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {reservations && reservations.length === pageSize && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                이전
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
