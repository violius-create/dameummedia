import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Plus, Search, Loader2, Trash2, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Checkbox } from "@/components/ui/checkbox";

export default function ReservationBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const pageSize = 10;

  // 예약 목록 조회
  const { data: reservations = [], isLoading } = trpc.reservations.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  // 섹션 제목 데이터 로드
  const { data: sectionData } = trpc.sectionTitles.get.useQuery({ sectionKey: 'reservation' });

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

          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="예약명, 담당자명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Reservations Table */}
          {filteredReservations && filteredReservations.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
              {/* Table Header - hidden on mobile */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 md:px-6 py-4 hidden md:block">
                <div className="flex gap-4 items-center text-sm font-semibold text-foreground">
                  <div className="w-[8%]">번호</div>
                  <div className="w-[60%]">행사명</div>
                  <div className="w-[12%]">작성자</div>
                  <div className="w-[10%]">날짜</div>
                  <div className="w-[10%] text-center">상태</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredReservations.map((reservation: any, index: number) => (
                  <Link key={reservation.id} href={`/reservation/${reservation.id}`}>
                    <div className={`hover:bg-gray-200 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      {/* Desktop layout */}
                      <div className="hidden md:flex px-6 py-4 gap-4 items-center text-sm">
                        <div className="w-[8%] text-foreground font-medium">
                          {reservation.id}
                        </div>
                        <div className="w-[60%] text-primary hover:underline truncate">
                          {reservation.eventName || "제목 없음"}
                        </div>
                        <div className="w-[12%] text-foreground">
                          {reservation.clientName || "-"}
                        </div>
                        <div className="w-[10%] text-muted-foreground">
                          {reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('ko-KR') : "-"}
                        </div>
                        <div className="w-[10%] flex justify-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(reservation.status)}`}>
                            {getStatusLabel(reservation.status)}
                          </span>
                        </div>
                      </div>
                      {/* Mobile layout */}
                      <div className="md:hidden px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-medium text-primary truncate flex-1 min-w-0">
                            {reservation.eventName || "제목 없음"}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${getStatusColor(reservation.status)}`}>
                            {getStatusLabel(reservation.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                          <span>{reservation.clientName || "-"}</span>
                          <span>·</span>
                          <span>{reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('ko-KR') : "-"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
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
