import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, ArrowRight } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function ConcertLiveGallery() {
  const [, setLocation] = useLocation();

  const { data: posts, isLoading } = trpc.posts.list.useQuery({
    category: "concert",
    limit: 100,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Concert Live</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation('/')}>돌아가기</Button>
          </div>
        </div>
      </nav>

      <div className="container py-16">
        {/* Header Section */}
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Concert Live</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">클래식 음악 공연</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            담음미디어가 기록한 다양한 클래식 음악 공연의 실황 영상과 사진입니다. 20년 이상의 경험으로 담신의 공연을 완벽하게 기록합니다.
          </p>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
                onClick={() => window.location.href = `/post/${post.id}`}
              >
                <div className="relative h-56 w-full bg-muted flex items-center justify-center overflow-hidden">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">이미지 없음</p>
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">{post.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/post/${post.id}`}>
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 게시물이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
