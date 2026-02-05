import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Upload } from "lucide-react";

export default function EditPost() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/posts/:id/edit");
  const postId = params?.id ? parseInt(params.id) : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("concert");

  // 기존 게시물 조회
  const { data: post, isLoading: isLoadingPost } = trpc.posts.getById.useQuery(
    { id: postId! },
    { enabled: !!postId }
  );

  // 게시물 데이터 로드
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setVideoUrl(post.videoUrl || "");
      setCategory(post.category || "concert");
      if (post.imageUrl) {
        setImagePreview(post.imageUrl);
      }
    }
  }, [post]);

  const uploadImageMutation = trpc.images.upload.useMutation();
  const updatePostMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      if (postId) {
        setLocation(`/posts/${postId}`);
      } else {
        alert("게시물이 수정되었습니다.");
        setLocation("/");
      }
    },
    onError: (error) => {
      setIsLoading(false);
      alert(`게시물 수정 실패: ${error.message}`);
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
    
    if (!postId) {
      alert("게시물을 찾을 수 없습니다.");
      return;
    }

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
      let imageUrl = imagePreview;

      // 새로운 이미지 파일이 있으면 업로드
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

            // 게시물 수정
            await updatePostMutation.mutateAsync({
              id: postId,
              title: title.trim(),
              content: content.trim(),
              imageUrl: imageUrl || undefined,
              videoUrl: videoUrl.trim() || undefined,
              category: category,
            });
          } catch (error) {
            setIsLoading(false);
            alert(`이미지 업로드 실패: ${error}`);
          }
        };
        reader.readAsDataURL(imageFile);
      } else {
        // 이미지 없이 게시물 수정
        await updatePostMutation.mutateAsync({
          id: postId,
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl.trim() || undefined,
          category: category,
        });
      }
    } catch (error) {
      setIsLoading(false);
      alert(`게시물 수정 실패: ${error}`);
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
    if (postId) {
      return `/posts/${postId}`;
    }
    switch (category) {
      case "concert":
        return "/concert-live";
      case "film":
        return "/making-film";
      default:
        return "/";
    }
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">게시물을 불러오는 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">게시물을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">{getCategoryLabel()} 수정</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation(category === 'concert' ? '/concert-live' : '/making-film')} 
                className="text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록보기
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation(getBackLink())} 
                className="text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8 sm:py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{getCategoryLabel()} 수정</CardTitle>
            <CardDescription>
              {getCategoryLabel()} 게시물을 수정합니다.
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
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="게시물 내용을 입력하세요..."
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
                  {isLoading ? "수정 중..." : "게시물 수정"}
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
