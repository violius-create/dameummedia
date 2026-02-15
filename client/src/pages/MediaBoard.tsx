import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  FileImage,
  ArrowLeft,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type ViewMode = "list" | "view" | "create" | "edit";

export default function MediaBoard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const limit = 10;

  // All hooks must be called before any conditional returns
  const {
    data: posts,
    isLoading,
    refetch,
  } = trpc.posts.list.useQuery({
    category: "media_board",
    limit,
    offset: page * limit,
  });

  const { data: totalCount, refetch: refetchCount } =
    trpc.posts.count.useQuery({
      category: "media_board",
    });

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("게시글이 작성되었습니다.");
      setViewMode("list");
      setFormTitle("");
      setFormContent("");
      refetch();
      refetchCount();
    },
    onError: (error: any) => {
      toast.error(`작성 실패: ${error.message}`);
    },
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      toast.success("게시글이 수정되었습니다.");
      setViewMode("list");
      setFormTitle("");
      setFormContent("");
      setEditingId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`수정 실패: ${error.message}`);
    },
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("게시글이 삭제되었습니다.");
      setViewMode("list");
      setViewingId(null);
      refetch();
      refetchCount();
    },
    onError: (error: any) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

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
        <p className="text-muted-foreground mb-6">
          이 페이지는 관리자만 접근할 수 있습니다.
        </p>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 0;

  const handleCreate = () => {
    if (!formTitle.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    createMutation.mutate({
      title: formTitle,
      content: formContent,
      category: "media_board",
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!formTitle.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      title: formTitle,
      content: formContent,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate({ id });
    }
  };

  const startEdit = (post: any) => {
    setEditingId(post.id);
    setFormTitle(post.title);
    setFormContent(post.content || "");
    setViewMode("edit");
  };

  const startCreate = () => {
    setFormTitle("");
    setFormContent("");
    setViewMode("create");
  };

  const goToList = () => {
    setViewMode("list");
    setViewingId(null);
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
  };

  // Helper: extract first image from HTML content for thumbnail
  const extractFirstImage = (html: string): string | null => {
    const match = html?.match(/<img[^>]+src="([^"]+)"/);
    return match ? match[1] : null;
  };

  // Helper: check if content has YouTube embed
  const hasYouTubeEmbed = (html: string): boolean => {
    return html?.includes("youtube") || html?.includes("youtu.be") || false;
  };

  // Helper: strip HTML tags for preview text
  const stripHtml = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  };

  // Create / Edit form
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="container py-10 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={goToList}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>
        <Card>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">
              {viewMode === "create" ? "새 게시글 작성" : "게시글 수정"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              본문 중간에 이미지나 YouTube 영상을 삽입할 수 있습니다. 툴바의
              업로드(⬆), 이미지(🖼), 영상(🎬) 버튼을 사용하세요.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  제목
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="게시글 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  내용
                </label>
                <RichTextEditor
                  content={formContent}
                  onChange={setFormContent}
                  placeholder="내용을 입력하세요. 이미지나 영상을 원하는 위치에 삽입할 수 있습니다..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={viewMode === "create" ? handleCreate : handleUpdate}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 저장
                      중...
                    </>
                  ) : viewMode === "create" ? (
                    "작성하기"
                  ) : (
                    "수정하기"
                  )}
                </Button>
                <Button variant="outline" onClick={goToList}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // View mode for a specific post
  if (viewMode === "view" && viewingId !== null) {
    const post = posts?.find((p: any) => p.id === viewingId);
    if (!post) {
      return (
        <div className="container py-10 text-center">
          <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={goToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </div>
      );
    }

    return (
      <div className="container py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={goToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEdit(post)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              수정
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(post.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              삭제
            </Button>
          </div>
        </div>
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
                [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-md [&_iframe]:my-4
                [&_div[data-youtube-video]]:w-full [&_div[data-youtube-video]_iframe]:w-full [&_div[data-youtube-video]_iframe]:aspect-video
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

  // List mode
  return (
    <div className="container py-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileImage className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">미디어 게시판</h1>
            <p className="text-sm text-muted-foreground">
              본문에 이미지와 영상을 자유롭게 삽입할 수 있는 게시판
            </p>
          </div>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-1" />
          글쓰기
        </Button>
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
            <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              아직 게시글이 없습니다.
            </p>
            <p className="text-xs text-muted-foreground">
              글쓰기 버튼을 눌러 이미지와 영상이 포함된 게시글을 작성해보세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any, index: number) => {
            const thumbnail = extractFirstImage(post.content);
            const hasVideo = hasYouTubeEmbed(post.content);
            const previewText = stripHtml(post.content);

            return (
              <Card
                key={post.id}
                className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => {
                  setViewingId(post.id);
                  setViewMode("view");
                }}
              >
                <div className="flex">
                  {/* Thumbnail */}
                  {thumbnail ? (
                    <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 bg-muted">
                      <img
                        src={thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 bg-muted/50 flex items-center justify-center">
                      {hasVideo ? (
                        <Video className="h-8 w-8 text-muted-foreground/50" />
                      ) : (
                        <FileImage className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-3 sm:p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm sm:text-base line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {thumbnail && (
                          <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {hasVideo && (
                          <Video className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                      {previewText}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span>최고관리자</span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {post.viewCount?.toLocaleString() || 0}
                      </span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
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
