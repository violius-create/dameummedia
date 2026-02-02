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
              <h1 className="text-xl font-bold text-foreground">Making Film</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation('/')} className="text-foreground">돌아가기</Button>
          </div>
        </div>
      </nav>

      <div className="container py-16">
        {/* Header Section */}
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Making Film</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-foreground">영상 제작 과정</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            담음미디어의 영상 제작 과정을 담은 영상입니다. 촬영부터 편집, 마스터링까지 전문적인 영상 제작 서비스를 제공합니다.
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
                className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group border border-border"
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
                      <Film className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">이미지 없음</p>
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg text-foreground">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">{post.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/post/${post.id}`}>
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 text-foreground">
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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
      </div>
    </div>
  );
}
