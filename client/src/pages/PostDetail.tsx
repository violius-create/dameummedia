import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Trash2, Edit } from "lucide-react";
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
              <Link href={post.category === 'concert' ? '/concert-live' : post.category === 'notice' ? '/notice' : '/making-film'}>
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
      <div className="container py-8 sm:py-16">
        <article className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {post.category === 'concert' ? 'Concert Live' : post.category === 'notice' ? '공지사항' : 'Making Film'}
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

              {/* Bottom Edit Button */}
              {isAuthenticated && user?.role === 'admin' && (
                <div className="flex gap-2 justify-center pt-8 border-t">
                  <Link href={`/admin?editId=${post.id}`}>
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
            <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8">다른 {post.category === 'concert' ? 'Concert Live' : post.category === 'notice' ? '공지사항' : 'Making Film'} 보기</h3>
            <RelatedPostsList category={post.category} currentPostId={post.id} />
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}

function RelatedPostsList({ category, currentPostId }: { category: string; currentPostId: number }) {
  const { data: relatedPosts } = trpc.posts.list.useQuery({
    category: category,
    limit: 6,
  });

  const filteredPosts = relatedPosts?.filter((p: any) => p.id !== currentPostId).slice(0, 3) || [];

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Link href={category === 'concert' ? '/concert-live' : '/making-film'}>
          <Button variant="outline">
            모든 {category === 'concert' ? 'Concert Live' : category === 'notice' ? '공지사항' : 'Making Film'} 보기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {filteredPosts.map((post: any) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `/posts/${post.id}`}>
          <div className="relative h-40 w-full bg-muted flex items-center justify-center">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Music className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <CardContent className="pt-4">
            <h4 className="font-semibold line-clamp-2 mb-2 text-xs sm:text-base">{post.title}</h4>
            <div 
              className="text-xs sm:text-sm text-muted-foreground line-clamp-2"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
