import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Plus, Search, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ReservationBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 예약 목록 조회
  const { data: reservations = [], isLoading } = trpc.reservations.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  const filteredReservations = reservations.filter((res: any) => 
    res.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-4xl font-bold text-foreground">예약 게시판</h1>
            <p className="text-lg text-muted-foreground">
              담음미디어의 예약 현황을 확인하세요.
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

          {/* Reservations List */}
          {filteredReservations && filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((reservation: any, index: number) => (
                <Link key={reservation.id} href={`/reservation/${reservation.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-foreground">
                            {reservation.eventName || "제목 없음"}
                          </CardTitle>
                          <CardDescription>
                            작성자: {reservation.clientName} | {new Date(reservation.createdAt).toLocaleDateString('ko-KR')}
                          </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ml-4 ${
                          reservation.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : reservation.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : reservation.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status === 'pending' ? '대기중' : 
                           reservation.status === 'confirmed' ? '확정' :
                           reservation.status === 'completed' ? '완료' :
                           '취소'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">문류</p>
                          <p className="font-medium text-foreground">
                            {reservation.eventType === 'concert' ? '콘서트' : 
                             reservation.eventType === 'film' ? '영상 제작' : '기타'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">장소</p>
                          <p className="font-medium text-foreground">{reservation.venue || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">행사일</p>
                          <p className="font-medium text-foreground">
                            {reservation.eventDate ? new Date(reservation.eventDate).toLocaleDateString('ko-KR') : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">결제액</p>
                          <p className="font-medium text-foreground">{(reservation.paidAmount || 0).toLocaleString()}원</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "검색 결과가 없습니다." : "예약이 없습니다."}
                </p>
                <Link href="/reservation">
                  <Button className="bg-primary text-white">
                    새 예약 작성하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
