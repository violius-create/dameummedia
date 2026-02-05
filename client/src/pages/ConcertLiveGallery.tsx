import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, ArrowRight, Trash2, Menu, X, Plus } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";

// HTML 태그를 제거하는 유틸리티 함수
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export default function ConcertLiveGallery() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load board layout settings
  const { data: concertSettings } = trpc.boardLayoutSettings.get.useQuery({ boardKey: 'concert_live' });
  const postsPerPage = concertSettings?.itemsPerPage || 12;
  const displayMode = concertSettings?.displayMode || 'gallery';
  const containerWidth = concertSettings?.containerWidth || 'default';
  const postWidth = concertSettings?.postWidth || 'auto';
  const postHeight = concertSettings?.postHeight || 'auto';
  const postMarginTop = concertSettings?.postMarginTop || '0';
  const postTitleSize = concertSettings?.postTitleSize || 'base';

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
  const { data: sectionTitle } = trpc.sectionTitles.get.useQuery({ sectionKey: 'concert_live' });

  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({
    category: "concert",
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
              <Music className="h-6 w-6 text-primary hidden sm:block" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Concert Live</h1>
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
                onClick={() => setLocation('/concert-live/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">글쓰기</span>
              </Button>
            </div>
          )}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground">{sectionTitle?.title || '클래식 음악 공연'}</h2>
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

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className={`grid gap-4 sm:gap-8 ${
            displayMode === 'list' ? 'grid-cols-1' :
            displayMode === 'gallery' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {posts.map((post) => (
              <div 
                key={post.id} 
                className={`relative group ${getWidthClass(postWidth)}`}
                style={{
                  marginTop: postMarginTop,
                  height: postHeight !== 'auto' ? postHeight : undefined
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
                  onClick={() => window.location.href = `/posts/${post.id}`}
                >
                  {displayMode === 'list' ? (
                    // 리스트형 레이아웃: 썸네일 왼쪽 + 내용 오른쪽
                    <div className="flex flex-col sm:flex-row sm:h-48">
                      <div 
                        className="relative h-48 sm:w-64 flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden"
                        style={{ marginRight: (postMarginTop && postMarginTop !== '0' && postMarginTop !== '0px' && postMarginTop !== '0rem') ? postMarginTop : '2rem' }}
                      >
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <Music className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-xs sm:text-sm">이미지 없음</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <CardHeader className="p-4 sm:p-6">
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg sm:text-xl text-foreground">{post.title}</CardTitle>
                          <CardDescription className="line-clamp-3 sm:line-clamp-4 mt-2 text-sm">{stripHtmlTags(post.content)}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0 mt-auto">
                          <Link href={`/post/${post.id}`}>
                            <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 text-foreground">
                              자세히 보기
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardContent>
                      </div>
                    </div>
                  ) : (
                    // 갤러리형 레이아웃: 썸네일 위 + 내용 아래
                    <>
                      <div 
                        className="relative w-full bg-muted flex items-center justify-center overflow-hidden"
                        style={{ height: postHeight !== 'auto' ? postHeight : undefined }}
                      >
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <Music className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-xs sm:text-sm">이미지 없음</p>
                          </div>
                        )}
                      </div>
                      <CardHeader className="flex-1 p-3 sm:p-6">
                        <CardTitle className={`line-clamp-2 group-hover:text-primary transition-colors ${getTitleSizeClass(postTitleSize)} text-foreground`}>{post.title}</CardTitle>
                        <CardDescription className="line-clamp-2 sm:line-clamp-3 mt-2 text-xs sm:text-sm">{stripHtmlTags(post.content)}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                        <Link href={`/post/${post.id}`}>
                          <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 text-foreground text-xs sm:text-sm">
                            자세히 보기
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </>
                  )}
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border border-border">
            <CardContent className="py-12 text-center">
              <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 게시물이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}
