import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Upload } from "lucide-react";

interface CreatePostProps {
  category?: string;
}

export default function CreatePost({ category = "concert" }: CreatePostProps) {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const uploadImageMutation = trpc.images.upload.useMutation();
  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: (post: any) => {
      setIsLoading(false);
      // 생성된 게시물의 상세 페이지로 이동
      const postId = post?.id || post?.[0]?.id;
      if (postId) {
        setLocation(`/posts/${postId}`);
      } else {
        alert("게시물이 생성되었습니다.");
        setLocation(getBackLink());
      }
    },
    onError: (error) => {
      setIsLoading(false);
      alert(`게시물 작성 실패: ${error.message}`);
    },
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

    try {
      let imageUrl = "";

      // 이미지 파일이 있으면 업로드
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileData = (event.target?.result as string).split(",")[1]; // base64 데이터만 추출
          
          try {
            const uploadResult = await uploadImageMutation.mutateAsync({
              fileName: imageFile.name,
              fileData: fileData,
              mimeType: imageFile.type,
            });
            
            imageUrl = uploadResult.fileUrl;

            // 게시물 생성
            await createPostMutation.mutateAsync({
              title: title.trim(),
              content: content.trim(),
              category,
              imageUrl: imageUrl || undefined,
              videoUrl: videoUrl.trim() || undefined,
            });
          } catch (error) {
            setIsLoading(false);
            alert(`이미지 업로드 실패: ${error}`);
          }
        };
        reader.readAsDataURL(imageFile);
      } else {
        // 이미지 없이 게시물 생성
        await createPostMutation.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          category,
          videoUrl: videoUrl.trim() || undefined,
        });
      }
    } catch (error) {
      setIsLoading(false);
      alert(`게시물 작성 실패: ${error}`);
    }
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
        <Card className="max-w-5xl mx-auto">
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

              {/* Image File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">이미지 파일</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">파일 선택</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                  {imageFile && (
                    <span className="text-sm text-muted-foreground">{imageFile.name}</span>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="max-w-xs h-auto rounded-md" />
                  </div>
                )}
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
