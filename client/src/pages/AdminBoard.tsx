import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit2, Trash2, ArrowLeft, Eye, Shield, Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Streamdown } from "streamdown";

export default function AdminBoard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const limit = 20;

  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({
    category: "admin_board",
    limit,
    offset: page * limit,
  });

  const { data: totalCount } = trpc.posts.count.useQuery({
    category: "admin_board",
  });

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      setShowCreateForm(false);
      setNewTitle("");
      setNewContent("");
      refetch();
    },
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      setEditingId(null);
      refetch();
    },
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container py-20 text-center">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h2>
        <p className="text-muted-foreground mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(post.id);
                    setEditTitle(post.title);
                    setEditContent(post.content);
                    setViewingId(null);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("정말 삭제하시겠습니까?")) {
                      deleteMutation.mutate({ id: post.id });
                      setViewingId(null);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <Streamdown>{post.content}</Streamdown>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">관리자게시판</h1>
            <p className="text-sm text-muted-foreground">관리자만 볼 수 있는 내부 게시판입니다</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          새 글 작성
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">새 글 작성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="제목을 입력하세요"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="내용을 입력하세요 (HTML 지원)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={8}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTitle("");
                  setNewContent("");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
              <Button
                onClick={() => {
                  if (!newTitle.trim()) return;
                  createMutation.mutate({
                    title: newTitle,
                    content: newContent || " ",
                    category: "admin_board",
                  });
                }}
                disabled={createMutation.isPending || !newTitle.trim()}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingId !== null && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">글 수정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="제목을 입력하세요"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <Textarea
              placeholder="내용을 입력하세요 (HTML 지원)"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={8}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
              <Button
                onClick={() => {
                  if (!editTitle.trim()) return;
                  updateMutation.mutate({
                    id: editingId,
                    title: editTitle,
                    content: editContent,
                  });
                }}
                disabled={updateMutation.isPending || !editTitle.trim()}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 게시글이 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-1">새 글을 작성해보세요.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post: any) => (
            <Card
              key={post.id}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setViewingId(post.id)}
            >
              <CardContent className="py-4 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                      {post.viewCount > 0 && (
                        <span className="ml-3">
                          <Eye className="h-3 w-3 inline mr-1" />
                          {post.viewCount}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingId(post.id);
                        setEditTitle(post.title);
                        setEditContent(post.content);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("정말 삭제하시겠습니까?")) {
                          deleteMutation.mutate({ id: post.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
