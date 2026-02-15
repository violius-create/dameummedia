import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Film, ArrowRight, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";

// HTML 태그를 제거하고 텍스트만 추출하는 유틸리티 함수
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  // HTML 태그 제거
  let text = html.replace(/<[^>]*>/g, '');
  // HTML 엔티티 디코딩
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  text = textarea.value;
  // 여러 공백을 하나로 축소하고 앞뒤 공백 제거
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

export default function MakingFilmGallery() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Load board layout settings
  const { data: filmSettings } = trpc.boardLayoutSettings.get.useQuery({ boardKey: 'making_film' });
  const postsPerPage = filmSettings?.itemsPerPage || 12;
  const displayMode = filmSettings?.displayMode || 'gallery';
  const containerWidth = filmSettings?.containerWidth || 'container';
  const postWidth = filmSettings?.postWidth || 'auto';
  const postHeight = filmSettings?.postHeight || 'auto';
  const postMarginTop = filmSettings?.postMarginTop || '0';
  const postTitleSize = filmSettings?.postTitleSize || 'base';

  // Convert postWidth to inline style (supports px values like "1400px" and percent values like "50%")
  const getPostWidthStyle = (width: string): React.CSSProperties | undefined => {
    if (width === 'auto' || !width) return undefined;
    if (width === 'full') return { width: '100%' };
    if (width === '1/2') return { width: '50%' };
    if (width === '1/3') return { width: '33.333%' };
    if (width === '1/4') return { width: '25%' };
    // Support direct CSS values like "50%", "300px"
    if (width.endsWith('%') || width.endsWith('px') || width.endsWith('rem')) return { width };
    return undefined;
  };

  // Convert containerWidth to class and style
  const getContainerClass = (cw: string) => {
    if (cw === 'full') return 'w-full px-4';
    // For px values or legacy named values, use mx-auto with padding
    if (cw === 'container') return 'container';
    return 'mx-auto px-4';
  };
  const getContainerStyle = (cw: string): React.CSSProperties | undefined => {
    if (cw === 'full' || cw === 'container') return undefined;
    if (cw === 'container-wide') return { maxWidth: '1536px' };
    // Parse px value like "1400px"
    const num = parseInt(cw);
    if (!isNaN(num)) return { maxWidth: `${num}px` };
    return undefined;
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
  const { data: sectionTitle } = trpc.sectionTitles.get.useQuery({ sectionKey: 'making_film' });

  // Get total count for pagination
  const { data: totalCount } = trpc.posts.count.useQuery({ category: 'film' });
  const totalPages = useMemo(() => {
    if (!totalCount) return 1;
    return Math.max(1, Math.ceil(totalCount / postsPerPage));
  }, [totalCount, postsPerPage]);

  const offset = useMemo(() => (currentPage - 1) * postsPerPage, [currentPage, postsPerPage]);

  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({
    category: "film",
    limit: postsPerPage,
    offset,
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="h-6 w-6 text-primary hidden sm:block" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Making Film</h1>
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

      <div className={`${getContainerClass(containerWidth)} py-8 sm:py-16`} style={getContainerStyle(containerWidth)}>
        {/* Header Section */}
        <div className="mb-4 sm:mb-8 space-y-4">
          {user?.role === 'admin' && (
            <div className="flex justify-end mb-6">
              <Button 
                onClick={() => setLocation('/making-film/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">글쓰기</span>
              </Button>
            </div>
          )}
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

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className={`grid gap-3 sm:gap-8 ${
            displayMode === 'list' ? 'grid-cols-2 sm:grid-cols-1' :
            displayMode === 'gallery' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className={`relative group ${
                  displayMode === 'list' ? (index % 2 === 0 ? 'bg-white' : 'bg-gray-100') : ''
                }`}
                style={{
                  marginTop: postMarginTop,
                  height: displayMode === 'list' && postHeight !== 'auto' ? postHeight : undefined,
                  ...getPostWidthStyle(postWidth)
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
                    // 리스트형 레이아웃: 모바일은 갤러리형, PC는 썸네일+내용 가로배치
                    <>
                      {/* 모바일: 갤러리형 카드 */}
                      <div className="flex flex-col h-full sm:hidden">
                        <div className="relative w-full bg-muted flex items-center justify-center overflow-hidden aspect-[4/3]">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">이미지 없음</p>
                            </div>
                          )}
                        </div>
                        <CardHeader className="flex-1 p-2" style={{ marginTop: '0.5rem' }}>
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-xs text-foreground">{post.title}</CardTitle>
                        </CardHeader>
                      </div>
                      {/* PC: 리스트형 */}
                      <div className="hidden sm:flex flex-row h-48">
                        <div 
                          className="relative h-48 w-64 flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden"
                          style={{ 
                            marginLeft: '20px',
                            marginRight: (postMarginTop && postMarginTop !== '0' && postMarginTop !== '0px' && postMarginTop !== '0rem') ? postMarginTop : '2rem' 
                          }}
                        >
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Film className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">이미지 없음</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <CardHeader className="p-6">
                            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-xl text-foreground">{post.title}</CardTitle>
                            <CardDescription className="line-clamp-4 mt-2 text-sm">{stripHtmlTags(post.content)}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-6 pt-0 mt-auto">
                            <Link href={`/post/${post.id}`}>
                              <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 text-foreground">
                                자세히 보기
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </CardContent>
                        </div>
                      </div>
                    </>
                  ) : (
                    // 갤러리형 레이아웃: 썸네일 위 + 내용 아래
                    <div className="flex flex-col h-full">
                      <div 
                        className={`relative w-full bg-muted flex items-center justify-center overflow-hidden aspect-[4/3] sm:aspect-auto ${postHeight === 'auto' ? 'sm:h-[300px]' : ''}`}
                        style={postHeight !== 'auto' ? { height: postHeight } : undefined}
                      >
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <Film className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-xs sm:text-sm">이미지 없음</p>
                          </div>
                        )}
                      </div>
                      <CardHeader className="flex-1 p-2 sm:p-6" style={{ marginTop: (postMarginTop && postMarginTop !== '0' && postMarginTop !== '0px' && postMarginTop !== '0rem') ? postMarginTop : '0.5rem' }}>
                        <CardTitle className={`line-clamp-2 group-hover:text-primary transition-colors text-xs sm:${getTitleSizeClass(postTitleSize)} text-foreground`}>{post.title}</CardTitle>
                        <CardDescription className="hidden sm:block line-clamp-2 sm:line-clamp-3 mt-2 text-xs sm:text-sm">{stripHtmlTags(post.content)}</CardDescription>
                      </CardHeader>
                      <CardContent className="hidden sm:block p-3 sm:p-6 pt-0 sm:pt-0">
                        <Link href={`/post/${post.id}`}>
                          <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 text-foreground text-xs sm:text-sm">
                            자세히 보기
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border border-border">
            <CardContent className="py-12 text-center">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 게시물이 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 sm:px-2 text-muted-foreground text-sm">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm ${
                    currentPage === page ? 'font-bold' : ''
                  }`}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
