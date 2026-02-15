import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Trash2, Edit, ChevronLeft, ChevronRight, Paperclip, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { CardDescription } from "@/components/ui/card";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Footer from "@/components/Footer";

export default function PostDetail() {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/posts/:id");
  const postId = params?.id ? parseInt(params.id) : null;

  console.log("PostDetail - postId:", postId, "params:", params);

  const { data: post, isLoading, error } = trpc.posts.getById.useQuery(
    { id: postId! },
    { enabled: !!postId }
  );

  console.log("PostDetail - post:", post, "error:", error, "isLoading:", isLoading);

  // Fetch attached images for this post
  const { data: attachedImages } = trpc.images.getByPostId.useQuery(
    { postId: postId! },
    { enabled: !!postId }
  );

  // Load board layout settings for container width
  const boardKey = post?.category === 'concert' ? 'concert_live' : post?.category === 'film' ? 'making_film' : post?.category === 'admin_board' ? 'admin_board' : 'notice';
  const { data: boardSettings } = trpc.boardLayoutSettings.get.useQuery(
    { boardKey },
    { enabled: !!post }
  );
  const containerWidth = boardSettings?.containerWidth || 'container';
  const getContainerClass = (width: string) => {
    switch(width) {
      case 'full': return 'w-full px-4';
      case 'container-wide': return 'mx-auto px-4';
      default: return 'container';
    }
  };
  const getContainerStyle = (width: string): React.CSSProperties | undefined => {
    if (width === 'container-wide') return { maxWidth: '1536px' };
    return undefined;
  };

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("게시글이 삭제되었습니다.");
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="container py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                돌아가기
              </Button>
            </Link>
          </div>
        </nav>
        <div className="container py-16">
          <div className="text-center text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="container py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                돌아가기
              </Button>
            </Link>
          </div>
        </nav>
        <div className="container py-16">
          <div className="text-center text-muted-foreground">게시글을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Link href={post.category === 'concert' ? '/concert-live' : post.category === 'notice' ? '/notice' : post.category === 'admin_board' ? '/admin-board' : '/making-film'}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  목록보기
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  홈으로
                </Button>
              </Link>
            </div>
            {isAuthenticated && user?.role === 'admin' && (
              <div className="flex gap-2">
                <Link href={`/posts/${post.id}/edit`}>
                  <Button variant="outline" size="sm" className="hover:text-neutral-400 transition-colors">
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("정말 삭제하시겠습니까?")) {
                      deletePostMutation.mutate({ id: post.id });
                    }
                  }}
                  disabled={deletePostMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className={`${getContainerClass(containerWidth)} py-8 sm:py-16`} style={getContainerStyle(containerWidth)}>
        <article className="mx-auto">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {post.category === 'concert' ? 'Concert Live' : post.category === 'notice' ? '공지사항' : post.category === 'admin_board' ? '관리자게시판' : 'Making Film'}
                  </span>
                </div>
                <CardTitle className="text-xl sm:text-4xl">{post.title}</CardTitle>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {post.createdAt && new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Featured Image */}
              {post.imageUrl && (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Video */}
              {post.videoUrl && (
                <div className="overflow-hidden rounded-lg">
                  {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={post.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={post.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <video
                        controls
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                      >
                        <source src={post.videoUrl} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-sm max-w-none dark:prose-invert text-sm sm:text-base [&_h1]:text-lg [&_h1]:sm:text-2xl [&_h2]:text-base [&_h2]:sm:text-xl [&_h3]:text-sm [&_h3]:sm:text-lg [&_p]:text-sm [&_p]:sm:text-base [&_li]:text-sm [&_li]:sm:text-base"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Attached Images */}
              {attachedImages && attachedImages.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    첨부파일 ({attachedImages.length})
                  </h4>
                  <div className="space-y-4">
                    {attachedImages.map((img) => {
                      const isImage = img.mimeType?.startsWith('image/');
                      if (isImage) {
                        return (
                          <div key={img.id} className="space-y-1">
                            <img
                              src={img.fileUrl}
                              alt={img.fileName}
                              className="max-w-full h-auto rounded-lg border border-border"
                            />
                            <p className="text-xs text-muted-foreground">{img.fileName}</p>
                          </div>
                        );
                      }
                      return (
                        <a
                          key={img.id}
                          href={img.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{img.fileName}</span>
                          {img.fileSize && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {(img.fileSize / 1024).toFixed(0)}KB
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Edit Button */}
              {isAuthenticated && user?.role === 'admin' && (
                <div className="flex gap-2 justify-center pt-8 border-t">
                  <Link href={`/posts/${post.id}/edit`}>
                    <Button variant="outline" className="hover:text-neutral-400 transition-colors">
                      <Edit className="mr-2 h-4 w-4" />
                      수정
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("정말 삭제하시겠습니까?")) {
                        deletePostMutation.mutate({ id: post.id });
                      }
                    }}
                    disabled={deletePostMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Posts */}
          <div className="mt-16">
            <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8">다른 {post.category === 'concert' ? 'Concert Live' : post.category === 'notice' ? '공지사항' : post.category === 'admin_board' ? '관리자게시판' : 'Making Film'} 보기</h3>
            <RelatedPostsList category={post.category} currentPostId={post.id} />
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}

function RelatedPostsList({ category, currentPostId }: { category: string; currentPostId: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Load board layout settings to match list page
  const boardKey = category === 'concert' ? 'concert_live' : (category === 'making_film' || category === 'film') ? 'making_film' : category === 'admin_board' ? 'admin_board' : 'notice';
  const { data: boardSettings } = trpc.boardLayoutSettings.get.useQuery({ boardKey });
  // Notice 카테고리는 항상 리스트 형식으로 표시
  const displayMode = category === 'notice' ? 'list' : (boardSettings?.displayMode || 'gallery');
  // 상세 페이지 하단에서는 3줄만 표시 (갤러리: 3열x3행=9개, 리스트: 3개)
  const postsPerPage = displayMode === 'gallery' ? 9 : 3;

  // Apply board layout settings for post items
  const containerWidth = boardSettings?.containerWidth || 'container';
  const postWidth = boardSettings?.postWidth || 'auto';
  const postHeight = boardSettings?.postHeight || 'auto';
  const postMarginTop = boardSettings?.postMarginTop || '0';
  const postTitleSize = boardSettings?.postTitleSize || 'base';

  const getContainerClass = (width: string) => {
    switch(width) {
      case 'full': return 'w-full px-4';
      case 'container-wide': return 'mx-auto px-4';
      default: return 'container';
    }
  };
  const getContainerStyle = (width: string): React.CSSProperties | undefined => {
    if (width === 'container-wide') return { maxWidth: '1536px' };
    return undefined;
  };

  const getWidthClass = (width: string) => {
    switch(width) {
      case 'full': return 'w-full';
      case '1/2': return 'w-1/2';
      case '1/3': return 'w-1/3';
      case '1/4': return 'w-1/4';
      default: return '';
    }
  };

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

  const { data: allPosts } = trpc.posts.list.useQuery({
    category: category,
    limit: 200,
  });

  const { data: totalCountData } = trpc.posts.count.useQuery({ category });
  
  const filteredPosts = useMemo(() => 
    allPosts?.filter((p: any) => p.id !== currentPostId) || [],
    [allPosts, currentPostId]
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => 
    filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage),
    [filteredPosts, currentPage, postsPerPage]
  );

  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    let text = html.replace(/<[^>]*>/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Link href={category === 'concert' ? '/concert-live' : category === 'notice' ? '/notice' : '/making-film'}>
          <Button variant="outline">
            모든 {category === 'concert' ? 'Concert Live' : category === 'notice' ? '공지사항' : 'Making Film'} 보기
          </Button>
        </Link>
      </div>
    );
  }

  const getCategoryPath = () => category === 'concert' ? '/concert-live' : category === 'notice' ? '/notice' : '/making-film';

  return (
    <div>
      {displayMode === 'list' ? (
        <div className="space-y-4">
          {paginatedPosts.map((post: any, index: number) => (
            <div
              key={post.id}
              className={`${getWidthClass(postWidth)}`}
              style={{
                marginTop: postMarginTop !== '0' ? postMarginTop : undefined,
                height: postHeight !== 'auto' ? postHeight : undefined
              }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `/posts/${post.id}`}>
                <div className="flex flex-col sm:flex-row h-auto sm:h-48">
                  <div className="relative w-full sm:w-64 h-40 sm:h-48 flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-4 sm:p-6">
                    <h4 className={`font-semibold line-clamp-2 mb-2 text-sm sm:${getTitleSizeClass(postTitleSize)}`}>{post.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">{stripHtmlTags(post.content)}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {paginatedPosts.map((post: any) => (
            <div
              key={post.id}
              className={`${getWidthClass(postWidth)}`}
              style={{
                marginTop: postMarginTop !== '0' ? postMarginTop : undefined
              }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `/posts/${post.id}`}>
                <div 
                  className={`relative w-full bg-muted flex items-center justify-center overflow-hidden aspect-[4/3] sm:aspect-auto ${postHeight === 'auto' ? 'sm:h-[300px]' : ''}`}
                  style={postHeight !== 'auto' ? { height: postHeight } : undefined}
                >
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <Music className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="pt-4">
                  <h4 className={`font-semibold line-clamp-2 mb-2 text-xs sm:${getTitleSizeClass(postTitleSize)}`}>{post.title}</h4>
                  <p className="hidden sm:line-clamp-3 text-xs sm:text-sm text-muted-foreground">{stripHtmlTags(post.content)}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {getPageNumbers().map((page, idx) => (
            typeof page === 'number' ? (
              <Button
                key={idx}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={idx} className="px-2 text-muted-foreground">...</span>
            )
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* View All Button */}
      <div className="text-center mt-6">
        <Link href={getCategoryPath()}>
          <Button variant="outline">
            모든 {category === 'concert' ? 'Concert Live' : category === 'notice' ? '공지사항' : 'Making Film'} 보기
          </Button>
        </Link>
      </div>
    </div>
  );
}
