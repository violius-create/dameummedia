import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">접근 거부</h1>
          <p className="text-muted-foreground">관리자만 접근 가능합니다.</p>
        </div>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState("posts");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("notice");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  const { data: posts, refetch: refetchPosts } = trpc.posts.list.useQuery({ limit: 100 });
  const { data: reservations, refetch: refetchReservations } = trpc.reservations.list.useQuery({ limit: 100 });
  const { data: concertGallery, refetch: refetchConcertGallery } = trpc.gallery.list.useQuery({ category: 'concert', limit: 100 });
  const { data: filmGallery, refetch: refetchFilmGallery } = trpc.gallery.list.useQuery({ category: 'film', limit: 100 });
  
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [galleryType, setGalleryType] = useState<'image' | 'video'>('image');
  const [galleryCategory, setGalleryCategory] = useState<'concert' | 'film'>('concert');
  const [galleryMediaUrl, setGalleryMediaUrl] = useState("");
  const [galleryThumbnailUrl, setGalleryThumbnailUrl] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  
  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("게시글이 작성되었습니다.");
      setTitle("");
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "게시글 작성에 실패했습니다.");
    },
  });
  
  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("게시글이 삭제되었습니다.");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "게시글 삭제에 실패했습니다.");
    },
  });
  
  const updateReservationMutation = trpc.reservations.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("예약 상태가 업데이트되었습니다.");
      refetchReservations();
    },
    onError: (error) => {
      toast.error(error.message || "예약 상태 업데이트에 실패했습니다.");
    },
  });
  
  const createGalleryMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("갤러리 항목이 추가되었습니다.");
      setGalleryTitle("");
      setGalleryDescription("");
      setGalleryMediaUrl("");
      setGalleryThumbnailUrl("");
      refetchConcertGallery();
      refetchFilmGallery();
    },
    onError: (error) => {
      toast.error(error.message || "갤러리 항목 추가에 실패했습니다.");
    },
  });
  
  const deleteGalleryMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("갤러리 항목이 삭제되었습니다.");
      refetchConcertGallery();
      refetchFilmGallery();
    },
    onError: (error) => {
      toast.error(error.message || "갤러리 항목 삭제에 실패했습니다.");
    },
  });

  const handleCreatePost = async () => {
    if (!title || !content) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }
    
    createPostMutation.mutate({
      title,
      content,
      category,
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">관리자 대시보드</h1>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>돌아가기</Button>
          </div>
        </div>
      </nav>
      
      <div className="container space-y-6 py-8">
        <div>
          <p className="text-muted-foreground">게시글, 예약, 이미지를 관리합니다.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">게시글 관리</TabsTrigger>
            <TabsTrigger value="reservations">예약 관리</TabsTrigger>
            <TabsTrigger value="gallery">갤러리 관리</TabsTrigger>
            <TabsTrigger value="images">이미지 관리</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>새 게시글 작성</CardTitle>
                <CardDescription>새로운 공지사항, 포트폴리오, 후기를 작성합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="게시글 제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notice">공지사항</SelectItem>
                      <SelectItem value="concert">Concert Live</SelectItem>
                      <SelectItem value="film">Making Film</SelectItem>
                      <SelectItem value="portfolio">포트폴리오</SelectItem>
                      <SelectItem value="review">후기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    placeholder="게시글 내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">이미지</Label>
                  {imageUrl && (
                    <div className="mb-2">
                      <img src={imageUrl} alt="Preview" className="max-w-xs h-auto rounded" />
                    </div>
                  )}
                  <FileUploadDropzone
                    onFileUpload={(url) => setImageUrl(url)}
                    accept="image/*"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">비디오 URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  게시글 작성
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>게시글 목록</CardTitle>
                <CardDescription>작성된 게시글을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts?.map((post) => (
                    <div key={post.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{post.title}</h4>
                        <p className="text-sm text-muted-foreground">{post.category} · {post.viewCount} views</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePostMutation.mutate({ id: post.id })}
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>예약 목록</CardTitle>
                <CardDescription>고객 예약을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reservations?.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{reservation.clientName}</h4>
                        <Select 
                          value={reservation.status}
                          onValueChange={(value) => updateReservationMutation.mutate({ id: reservation.id, status: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="confirmed">확인됨</SelectItem>
                            <SelectItem value="completed">완료</SelectItem>
                            <SelectItem value="cancelled">취소</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-muted-foreground">{reservation.clientEmail}</p>
                      <p className="text-sm text-muted-foreground">{reservation.clientPhone}</p>
                      <p className="text-sm text-muted-foreground">{reservation.eventType} · {reservation.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>새 갤러리 항목 추가</CardTitle>
                <CardDescription>Concert Live 또는 Making Film 갤러리에 이미지/영상을 추가합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gallery-title">제목</Label>
                  <Input
                    id="gallery-title"
                    placeholder="갤러리 항목 제목"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gallery-description">설명</Label>
                  <Textarea
                    id="gallery-description"
                    placeholder="갤러리 항목 설명"
                    value={galleryDescription}
                    onChange={(e) => setGalleryDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gallery-type">타입</Label>
                    <Select value={galleryType} onValueChange={(value) => setGalleryType(value as any)}>
                      <SelectTrigger id="gallery-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">이미지</SelectItem>
                        <SelectItem value="video">영상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gallery-category">카테고리</Label>
                    <Select value={galleryCategory} onValueChange={(value) => setGalleryCategory(value as any)}>
                      <SelectTrigger id="gallery-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concert">Concert Live</SelectItem>
                        <SelectItem value="film">Making Film</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gallery-media-url">미디어 URL</Label>
                  <Input
                    id="gallery-media-url"
                    placeholder="https://example.com/image.jpg 또는 https://youtube.com/embed/..."
                    value={galleryMediaUrl}
                    onChange={(e) => setGalleryMediaUrl(e.target.value)}
                  />
                </div>
                
                {galleryType === 'video' && (
                  <div className="space-y-2">
                    <Label htmlFor="gallery-thumbnail-url">썸네일 URL (영상용)</Label>
                    <Input
                      id="gallery-thumbnail-url"
                      placeholder="https://example.com/thumbnail.jpg"
                      value={galleryThumbnailUrl}
                      onChange={(e) => setGalleryThumbnailUrl(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>파일 업로드</Label>
                  <FileUploadDropzone
                    onUploadSuccess={(file) => {
                      setGalleryMediaUrl(file.url);
                      setUploadedFileUrl(file.url);
                    }}
                    accept={galleryType === 'video' ? 'video/*' : 'image/*'}
                    maxSize={100}
                  />
                </div>
                
                <Button 
                  onClick={() => {
                    if (!galleryTitle || (!galleryMediaUrl && !uploadedFileUrl)) {
                      toast.error("제목과 미디어 URL을 입력해주세요.");
                      return;
                    }
                    createGalleryMutation.mutate({
                      title: galleryTitle,
                      description: galleryDescription || undefined,
                      type: galleryType,
                      category: galleryCategory,
                      mediaUrl: uploadedFileUrl || galleryMediaUrl,
                      thumbnailUrl: galleryThumbnailUrl || undefined,
                      fileKey: `gallery-${Date.now()}`,
                    });
                    setUploadedFileUrl("");
                  }}
                  disabled={createGalleryMutation.isPending}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createGalleryMutation.isPending ? '추가 중...' : '갤러리 항목 추가'}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Concert Live 갤러리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {concertGallery?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.type === 'video' ? '🎬 영상' : '📷 이미지'}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteGalleryMutation.mutate({ id: item.id })}
                        disabled={deleteGalleryMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Making Film 갤러리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filmGallery?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.type === 'video' ? '🎬 영상' : '📷 이미지'}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteGalleryMutation.mutate({ id: item.id })}
                        disabled={deleteGalleryMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>이미지 업로드</CardTitle>
                <CardDescription>새로운 이미지를 업로드합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      이미지를 드래그하거나 클릭하여 업로드합니다.
                    </p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      id="image-upload"
                    />
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      파일 선택
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
