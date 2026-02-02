import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Film, ArrowRight } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function MakingFilmGallery() {
  const [, setLocation] = useLocation();

  const { data: posts, isLoading } = trpc.posts.list.useQuery({
    category: "film",
    limit: 100,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Making Film</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation('/')}>돌아가기</Button>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Making Film</h2>
          <p className="text-lg text-muted-foreground">
            담음미디어의 영화 제작 과정, 촬영 장면, 그리고 완성된 작품들을 소개합니다.
          </p>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => window.location.href = `/post/${post.id}`}
              >
                <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Film className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">이미지 없음</p>
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1">
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{post.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/post/${post.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 게시물이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
