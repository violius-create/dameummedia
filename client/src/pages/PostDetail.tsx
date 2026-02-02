import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Trash2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PostDetail() {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/post/:id");
  const postId = params?.id ? parseInt(params.id) : null;

  const { data: post, isLoading } = trpc.posts.getById.useQuery(
    { id: postId! },
    { enabled: !!postId }
  );

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
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                돌아가기
              </Button>
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
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
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-16">
        <article className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {post.category === 'concert' ? 'Concert Live' : 'Making Film'}
                  </span>
                </div>
                <CardTitle className="text-4xl">{post.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
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
                    <iframe
                      width="100%"
                      height="500"
                      src={post.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title={post.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full"
                    />
                  ) : (
                    <video
                      width="100%"
                      height="500"
                      controls
                      className="w-full"
                    >
                      <source src={post.videoUrl} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8">다른 {post.category === 'concert' ? 'Concert Live' : 'Making Film'} 보기</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Related posts would go here */}
              <div className="text-center text-muted-foreground py-8">
                <Link href={post.category === 'concert' ? '/concert-live' : '/making-film'}>
                  <Button variant="outline">
                    모든 {post.category === 'concert' ? 'Concert Live' : 'Making Film'} 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
