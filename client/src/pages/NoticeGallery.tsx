import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bell, ArrowRight, Trash2, Plus } from "lucide-react";
import { useLocation, Link } from "wouter";
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
  const displayMode = noticeSettings?.displayMode || 'list';
  const containerWidth = noticeSettings?.containerWidth || 'default';
  const postWidth = noticeSettings?.postWidth || 'auto';
  const postHeight = noticeSettings?.postHeight || 'auto';
  const postMarginTop = noticeSettings?.postMarginTop || '0';
  const postTitleSize = noticeSettings?.postTitleSize || 'base';
  const boardTitleSize = noticeSettings?.boardTitleSize || '4xl';
  const boardTitleMarginTop = noticeSettings?.boardTitleMarginTop || '0';

  // Convert boardTitleSize to CSS class
  const getBoardTitleSizeClass = (size: string) => {
    switch(size) {
      case '2xl': return 'text-2xl sm:text-3xl md:text-4xl';
      case '3xl': return 'text-3xl sm:text-4xl md:text-5xl';
      case '4xl': return 'text-4xl sm:text-5xl md:text-6xl';
      case '5xl': return 'text-5xl sm:text-6xl md:text-7xl';
      case '6xl': return 'text-6xl sm:text-7xl md:text-8xl';
      default: return 'text-4xl sm:text-5xl md:text-6xl';
    }
  };

  // Convert postWidth to CSS class
  const getWidthClass = (width: string) => {
    switch(width) {
      case 'full': return 'w-full';
      case '1/2': return 'w-1/2';
      case '1/3': return 'w-1/3';
      case '1/4': return 'w-1/4';
      default: return '';
    }
  };

  // Convert postTitleSize to CSS class
  const getTitleSizeClass = (size: string) => {
    switch(size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'base': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      case '2xl': return 'text-2xl';
      default: return 'text-base';
    }
  };

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
      </nav>

      <div className={`${
        containerWidth === 'full' ? 'w-full px-4' :
        containerWidth === 'container-wide' ? 'max-w-7xl mx-auto px-4' :
        'container'
      } py-8 sm:py-16`}>
        {/* Header Section */}
        <div className="mb-4 sm:mb-8 space-y-4">
          {user?.role === 'admin' && (
            <div className="flex justify-end mb-6">
              <Button 
                onClick={() => setLocation('/notice/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">글쓰기</span>
              </Button>
            </div>
          )}
          <h2 
            className={`${getBoardTitleSizeClass(boardTitleSize)} font-bold leading-tight text-foreground`}
            style={{ marginTop: boardTitleMarginTop }}
          >
            {sectionTitle?.title || '공지사항'}
          </h2>
          {sectionTitle?.description && (
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl">
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

        {/* Posts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className={`relative group ${getWidthClass(postWidth)}`}
                style={{
                  marginTop: postMarginTop
                }}
              >
                {user?.role === 'admin' && (
                  <div className="absolute top-2 left-2 z-10 bg-white rounded-lg p-2 shadow-md">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={() => handleToggleSelect(post.id)}
                      className="w-4 h-4 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <Card
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border border-border"
                  style={{ height: postHeight !== 'auto' ? postHeight : undefined }}
                  onClick={() => window.location.href = `/posts/${post.id}`}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="flex flex-col flex-1">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className={`line-clamp-2 group-hover:text-primary transition-colors ${getTitleSizeClass(postTitleSize)} text-foreground`}>{post.title}</CardTitle>
                        <CardDescription className="line-clamp-2 sm:line-clamp-3 mt-2 text-sm">
                          {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </CardDescription>
                      </CardHeader>
                    </div>
                  </div>
                </Card>
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
