import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wrench, ArrowLeft, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Atelier01() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [page, setPage] = useState(0);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const limit = 10;

  // 관리자 전용 페이지 - 인증 로딩 중이면 로딩 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 관리자가 아니면 접근 차단
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h2>
        <p className="text-muted-foreground mb-6">이 페이지는 관리자만 접근할 수 있습니다.</p>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const { data: posts, isLoading } = trpc.posts.list.useQuery({
    category: "atelier01",
    limit,
    offset: page * limit,
  });

  const { data: totalCount } = trpc.posts.count.useQuery({
    category: "atelier01",
  });

  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 0;

  // View mode for a specific post
  if (viewingId !== null) {
    const post = posts?.find((p: any) => p.id === viewingId);
    if (!post) {
      return (
        <div className="container py-10 text-center">
          <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => setViewingId(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </div>
      );
    }

    return (
      <div className="container py-10 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => setViewingId(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>
        <Card>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span>최고관리자</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount?.toLocaleString() || 0}
              </span>
              <span>·</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <Separator />
          <CardContent className="pt-6">
            <div
              className="prose prose-sm max-w-none dark:prose-invert
                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4
                [&_iframe]:max-w-full [&_iframe]:rounded-md [&_iframe]:my-4
                [&_p]:leading-relaxed [&_p]:mb-4
                [&_table]:border-collapse [&_table]:w-full
                [&_td]:border [&_td]:border-border [&_td]:p-2
                [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted
                [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">DIY Atelier</h1>
          <p className="text-sm text-muted-foreground">
            직접 만드는 음향·영상 장비 DIY 프로젝트
          </p>
        </div>
      </div>

      {/* Total count */}
      <div className="text-sm text-muted-foreground mb-4">
        Total {totalCount || 0}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 게시글이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-0 divide-y divide-border rounded-lg border border-border overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
            <span className="w-12 text-center">번호</span>
            <span className="flex-1 ml-3">제목</span>
            <span className="w-20 text-center hidden sm:block">작성자</span>
            <span className="w-16 text-center hidden sm:block">조회</span>
            <span className="w-20 text-center hidden sm:block">날짜</span>
          </div>
          {posts.map((post: any, index: number) => (
            <div
              key={post.id}
              className="flex items-center px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setViewingId(post.id)}
            >
              <span className="w-12 text-center text-sm text-muted-foreground">
                {(totalCount || 0) - (page * limit + index)}
              </span>
              <div className="flex-1 ml-3 min-w-0">
                <h3 className="font-medium text-sm truncate">{post.title}</h3>
              </div>
              <span className="w-20 text-center text-xs text-muted-foreground hidden sm:block">
                최고관리자
              </span>
              <span className="w-16 text-center text-xs text-muted-foreground hidden sm:block">
                {post.viewCount?.toLocaleString() || 0}
              </span>
              <span className="w-20 text-center text-xs text-muted-foreground hidden sm:block">
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={page === i ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setPage(i)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
