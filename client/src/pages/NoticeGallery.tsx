import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bell, Trash2, Plus, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";

export default function NoticeGallery() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Load board layout settings
  const { data: noticeSettings } = trpc.boardLayoutSettings.get.useQuery({ boardKey: 'notice' });
  const postsPerPage = noticeSettings?.itemsPerPage || 20;

  // Load section title data
  const { data: sectionTitle } = trpc.sectionTitles.get.useQuery({ sectionKey: 'notice' });

  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({
    category: "notice",
    limit: postsPerPage,
  });

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      setSelectedIds([]);
      refetch();
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.length === posts?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts?.map(p => p.id) || []);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`${selectedIds.length}개 항목을 삭제하시겠습니까?`)) return;
    
    for (const id of selectedIds) {
      await deletePostMutation.mutateAsync({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary hidden sm:block" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Notice</h1>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <Button 
                  onClick={() => setLocation('/notice/new')}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">글쓰기</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation('/')} 
                className="text-foreground"
              >
                돌아가기
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8 sm:py-16">
        {/* Header Section */}
        <div className="mb-4 sm:mb-8 space-y-4">
          <h2 className="text-2xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground">{sectionTitle?.title || ''}</h2>
          {sectionTitle?.description && (
            <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl">
              {sectionTitle.description}
            </p>
          )}
        </div>

        {/* Admin Controls */}
        {user?.role === 'admin' && posts && posts.length > 0 && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length === posts.length && posts.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium">
                {selectedIds.length > 0 ? `${selectedIds.length}개 선택됨` : '모두 선택'}
              </span>
            </div>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deletePostMutation.isPending}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                선택 항목 삭제
              </Button>
            )}
          </div>
        )}

        {/* Posts List - Compact table-like layout */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-0 divide-y divide-border rounded-lg border border-border overflow-hidden">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center px-4 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/posts/${post.id}`}
              >
                {/* Admin checkbox */}
                {user?.role === 'admin' && (
                  <div className="mr-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={() => handleToggleSelect(post.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                )}

                {/* Title + Date + Views on same line */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <h3 className="font-medium truncate text-sm text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                  {(post as any).viewCount > 0 && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {(post as any).viewCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border border-border">
            <CardContent className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 공지사항이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}
