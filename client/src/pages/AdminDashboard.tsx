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
import { Upload, Trash2, Plus, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // All hooks must be called before any conditional returns
  const [activeTab, setActiveTab] = useState("posts");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("notice");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<number>>(new Set());
  
  const { data: posts, refetch: refetchPosts } = trpc.posts.list.useQuery({ limit: 100 });
  
  // Extract editId from URL
  const getEditIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    return editId ? parseInt(editId) : null;
  };
  
  const editIdFromUrl = getEditIdFromUrl();
  
  // Effect: Load post data from posts list when editId is in URL
  useEffect(() => {
    const editId = getEditIdFromUrl();

    if (editId && posts && posts.length > 0) {
      const post = posts.find(p => p.id === editId);

      if (post) {

        setEditingPostId(editId);
        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category);
        setImageUrl(post.imageUrl || '');
        setImageFileName('');
        setVideoUrl(post.videoUrl || '');
        setActiveTab('posts');
      }
    } else if (!editId) {
      // Clear editing state if no editId in URL
      setEditingPostId(null);
      setTitle('');
      setContent('');
      setCategory('notice');
      setImageUrl('');
      setImageFileName('');
      setVideoUrl('');
    }
  }, [posts, editIdFromUrl]);

  const { data: reservations, refetch: refetchReservations } = trpc.reservations.list.useQuery({ limit: 100 });
  const { data: concertGallery, refetch: refetchConcertGallery } = trpc.gallery.list.useQuery({ category: 'concert', limit: 100 });
  const { data: filmGallery, refetch: refetchFilmGallery } = trpc.gallery.list.useQuery({ category: 'film', limit: 100 });
  
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [galleryType, setGalleryType] = useState<'image' | 'video'>('image');
  const [galleryCategory, setGalleryCategory] = useState<'concert' | 'film'>('concert');
  
  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("게시글이 작성되었습니다.");
      setTitle('');
      setContent('');
      setCategory('notice');
      setImageUrl('');
      setImageFileName('');
      setVideoUrl('');
      setActiveTab('posts');
    },
    onError: (error) => {
      toast.error(`작성 실패: ${error.message}`);
    },
  });

  const updatePostMutation = trpc.posts.update.useMutation({
    onSuccess: (data) => {
      toast.success("게시글이 수정되었습니다.");
      setTitle('');
      setContent('');
      setCategory('notice');
      setImageUrl('');
      setVideoUrl('');
      setEditingPostId(null);
      setImageFileName('');
      refetchPosts();
      if (data && data.id) {
        window.location.href = `/post/${data.id}`;
      }
    },
    onError: (error) => {
      toast.error(`수정 실패: ${error.message}`);
    },
  });

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("게시글이 삭제되었습니다.");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  const handleTogglePostSelection = (postId: number) => {
    const newSelected = new Set(selectedPostIds);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPostIds(newSelected);
  };

  const handleSelectAllPosts = () => {
    if (selectedPostIds.size === posts?.length) {
      setSelectedPostIds(new Set());
    } else {
      const allIds = new Set(posts?.map((p: any) => p.id) || []);
      setSelectedPostIds(allIds);
    }
  };

  const handleDeleteSelectedPosts = async () => {
    if (selectedPostIds.size === 0) {
      toast.error("삭제할 게시글을 선택해주세요.");
      return;
    }
    if (window.confirm(`${selectedPostIds.size}개의 게시글을 삭제하시겠습니까?`)) {
      for (const postId of selectedPostIds) {
        await deletePostMutation.mutateAsync({ id: postId });
      }
      setSelectedPostIds(new Set());
      refetchPosts();
    }
  }

  const handlePostSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    if (editingPostId) {
      updatePostMutation.mutate({
        id: editingPostId,
        title,
        content,
        category: category as any,
        imageUrl: imageUrl && imageUrl.trim() ? imageUrl : undefined,
        videoUrl: videoUrl && videoUrl.trim() ? videoUrl : undefined,
      });
    } else {
      createPostMutation.mutate({
        title,
        content,
        category: category as any,
        imageUrl: imageUrl && imageUrl.trim() ? imageUrl : undefined,
        videoUrl: videoUrl && videoUrl.trim() ? videoUrl : undefined,
      });
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category);
    setImageUrl(post.imageUrl || '');
    setVideoUrl(post.videoUrl || '');
    setActiveTab('posts');
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle('');
    setContent('');
    setCategory('notice');
    setImageUrl('');
    setImageFileName('');
    setVideoUrl('');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <p>관리자만 접근할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            돌아가기
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="posts">게시글 관리</TabsTrigger>
            <TabsTrigger value="reservations">예약 관리</TabsTrigger>
            <TabsTrigger value="gallery">갤러리 관리</TabsTrigger>
            <TabsTrigger value="images">이미지 관리</TabsTrigger>
            <TabsTrigger value="background">배경 관리</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingPostId ? '게시글 수정' : '새 게시글 작성'}</CardTitle>
                <CardDescription>
                  새로운 공지사항, 포트폴리오, 후기를 작성합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="게시글 제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notice">공지사항</SelectItem>
                      <SelectItem value="concert">Concert Live</SelectItem>
                      <SelectItem value="film">Making Film</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    placeholder="게시글 내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <div>
                  <Label>이미지</Label>
                  <FileUploadDropzone
                    onUploadSuccess={(file) => {
                      setImageUrl(file.url);
                      setImageFileName(file.fileName);
                    }}
                  />
                  {imageUrl && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">현재 이미지:</p>
                      <p className="text-sm font-semibold mt-1">{imageFileName || 'URL: ' + imageUrl.substring(0, 50) + '...'}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setImageUrl('');
                          setImageFileName('');
                        }}
                        className="mt-2"
                      >
                        이미지 제거
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="videoUrl">비디오 URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePostSubmit}
                    disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  >
                    {editingPostId ? '게시글 수정' : '게시글 작성'}
                  </Button>
                  {editingPostId && (
                    <Button variant="outline" onClick={handleCancelEdit}>
                      취소
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>게시글 목록</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllPosts}
                    >
                      {selectedPostIds.size === posts?.length && posts?.length > 0 ? "모두 취소" : "모두 선택"}
                    </Button>
                    {selectedPostIds.size > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteSelectedPosts}
                      >
                        {selectedPostIds.size}개 삭제
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {posts?.map((post: any) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedPostIds.has(post.id)}
                          onChange={() => handleTogglePostSelection(post.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <h3 className="font-semibold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">{post.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPost(post)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePostMutation.mutate({ id: post.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reservations?.map((reservation: any) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h3 className="font-semibold">{reservation.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {reservation.email}
                        </p>
                      </div>
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
                <CardTitle>갤러리 추가</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="galleryTitle">제목</Label>
                  <Input
                    id="galleryTitle"
                    placeholder="갤러리 제목"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="galleryDescription">설명</Label>
                  <Textarea
                    id="galleryDescription"
                    placeholder="갤러리 설명"
                    value={galleryDescription}
                    onChange={(e) => setGalleryDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="galleryType">타입</Label>
                  <Select
                    value={galleryType}
                    onValueChange={(value: any) => setGalleryType(value)}
                  >
                    <SelectTrigger id="galleryType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">이미지</SelectItem>
                      <SelectItem value="video">비디오</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="galleryCategory">카테고리</Label>
                  <Select
                    value={galleryCategory}
                    onValueChange={(value: any) => setGalleryCategory(value)}
                  >
                    <SelectTrigger id="galleryCategory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concert">Concert Live</SelectItem>
                      <SelectItem value="film">Making Film</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  갤러리 추가
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Concert Live 갤러리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {concertGallery?.map((item: any) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
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
                <div className="grid grid-cols-3 gap-4">
                  {filmGallery?.map((item: any) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
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
                <CardTitle>이미지 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">이미지 관리 기능</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>메인 타이틀 배경 관리</CardTitle>
                <CardDescription>메인 페이지 상단의 배경 이미지/영상을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">배경 관리 기능이 준비 중입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
