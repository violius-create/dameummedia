import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft } from "lucide-react";

interface CreatePostProps {
  category?: string;
}

export default function CreatePost({ category = "concert" }: CreatePostProps) {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: (post: any) => {
      setIsLoading(false);
      // 생성된 게시물의 상세 페이지로 이동
      setLocation(`/posts/${post?.id || 1}`);
    },
    onError: (error) => {
      setIsLoading(false);
      alert(`게시물 작성 실패: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    await createPostMutation.mutateAsync({
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "concert":
        return "Concert Live";
      case "film":
        return "Making Film";
      default:
        return "게시물";
    }
  };

  const getBackLink = () => {
    switch (category) {
      case "concert":
        return "/concert-live";
      case "film":
        return "/making-film";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">새 {getCategoryLabel()} 작성</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation(getBackLink())} 
              className="text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8 sm:py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>새 {getCategoryLabel()} 작성</CardTitle>
            <CardDescription>
              {getCategoryLabel()}에 새로운 게시물을 작성합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">제목 *</label>
                <Input
                  type="text"
                  placeholder="게시물 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">내용 *</label>
                <Textarea
                  placeholder="게시물 내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isLoading}
                  rows={8}
                  className="w-full resize-none"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">이미지 URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">동영상 URL</label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isLoading ? "작성 중..." : "게시물 작성"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(getBackLink())}
                  disabled={isLoading}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
