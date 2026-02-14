import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
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
  const [activeTab, setActiveTab] = useState("prices");
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

  const setFeaturedMutation = trpc.posts.setFeatured.useMutation({
    onSuccess: () => {
      toast.success("Featured 게시물이 설정되었습니다.");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(`Featured 설정 실패: ${error.message}`);
    },
  });

  const unsetFeaturedMutation = trpc.posts.unsetFeatured.useMutation({
    onSuccess: () => {
      toast.success("Featured 설정이 해제되었습니다.");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(`Featured 해제 실패: ${error.message}`);
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
      const postIdsArray = Array.from(selectedPostIds);
      for (const postId of postIdsArray) {
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
          <TabsList className="flex flex-wrap h-auto gap-1 w-full justify-start p-1">
            <TabsTrigger value="prices">가격표 관리</TabsTrigger>
            <TabsTrigger value="posts">게시글 관리</TabsTrigger>
            <TabsTrigger value="branding">사이트 브랜딩</TabsTrigger>
            <TabsTrigger value="background" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/hero-background'; }}>배경 영상 관리</TabsTrigger>
            <TabsTrigger value="section-titles" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/section-titles'; }}>게시판 제목 관리</TabsTrigger>
            <TabsTrigger value="footer" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/footer-settings'; }}>Footer 설정</TabsTrigger>
            <TabsTrigger value="layout" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/board-layout-settings'; }}>게시판 레이아웃</TabsTrigger>
            <TabsTrigger value="instagram" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/instagram-posts'; }}>Instagram 관리</TabsTrigger>
            <TabsTrigger value="hero-text" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/hero-text-rotation'; }}>히어로 텍스트</TabsTrigger>
            <TabsTrigger value="information" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/information'; }}>Information 관리</TabsTrigger>
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
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="게시글 내용을 입력하세요..."
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{post.title}</h3>
                            {post.featured === 1 && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                                ★ Featured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{post.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(post.category === 'concert' || post.category === 'film') && (
                          <Button
                            size="sm"
                            variant={post.featured === 1 ? "default" : "outline"}
                            onClick={() => {
                              if (post.featured === 1) {
                                unsetFeaturedMutation.mutate({ postId: post.id });
                              } else {
                                setFeaturedMutation.mutate({ postId: post.id, category: post.category });
                              }
                            }}
                            disabled={setFeaturedMutation.isPending || unsetFeaturedMutation.isPending}
                            className="text-xs"
                          >
                            {post.featured === 1 ? '★ Featured 해제' : '☆ Featured'}
                          </Button>
                        )}
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


          {/* Prices Tab */}
          <TabsContent value="prices" className="space-y-6">
            <AdminPrices />
          </TabsContent>

          {/* Site Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <AdminSiteBranding />
          </TabsContent>

          {/* Footer Settings Tab */}
          <TabsContent value="footer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Footer 설정</CardTitle>
                <CardDescription>
                  웹사이트 하단에 표시될 정보를 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/admin/footer-settings'}
                  className="w-full"
                >
                  Footer 설정 페이지로 이동
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Board Layout Settings Tab */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>게시판 레이아웃 설정</CardTitle>
                <CardDescription>
                  게시판/갤러리의 게시물 개수, 표시 방법, 전체 폭을 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/admin/board-layout-settings'}
                  className="w-full"
                >
                  게시판 레이아웃 설정 페이지로 이동
                </Button>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}

// Site Branding Component
function AdminSiteBranding() {
  const { data: branding } = trpc.siteBranding.get.useQuery();
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    if (branding) {
      setLogoUrl(branding.logoUrl || "");
      setTitle(branding.title || "");
      setSubtitle(branding.subtitle || "");
      setInstagramUrl(branding.instagramUrl || "");
      setYoutubeUrl(branding.youtubeUrl || "");
    }
  }, [branding]);

  const updateBrandingMutation = trpc.siteBranding.update.useMutation({
    onSuccess: () => {
      toast.success("사이트 브랜딩이 업데이트되었습니다.");
    },
    onError: (error) => {
      toast.error(`업데이트 실패: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateBrandingMutation.mutate({
      logoUrl: logoUrl || undefined,
      title: title || undefined,
      subtitle: subtitle || undefined,
      instagramUrl: instagramUrl || undefined,
      youtubeUrl: youtubeUrl || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>사이트 브랜딩 설정</CardTitle>
        <CardDescription>
          메인 페이지의 좌측 로고와 타이틀을 관리합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="logo">로고 이미지</Label>
          <div className="space-y-3">
            {/* Logo URL Input */}
            <div>
              <Label htmlFor="logoUrl" className="text-sm text-gray-600">로고 URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            {/* Logo File Upload */}
            <div>
              <Label className="text-sm text-gray-600">또는 파일 업로드</Label>
              <FileUploadDropzone
                onUploadSuccess={(file) => {
                  setLogoUrl(file.url);
                  setLogoFileName(file.fileName);
                }}
                accept="image/*"
                maxSize={10}
              />
            </div>
          </div>
          
          {logoUrl && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-gray-100 rounded">
              <img src={logoUrl} alt="Logo Preview" className="h-12 w-12 rounded" />
              <span className="text-sm text-gray-600">{logoFileName || '로고 미리보기'}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">타이틀</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="담음미디어"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">부제목 (YouTube Channel Growth Strategy 부분)</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Professional Media Production"
          />
        </div>

        {/* Instagram URL */}
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input
            id="instagramUrl"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/yourprofile"
          />
        </div>

        {/* YouTube URL */}
        <div className="space-y-2">
          <Label htmlFor="youtubeUrl">YouTube URL</Label>
          <Input
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/yourchannel"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateBrandingMutation.isPending}
          className="w-full"
        >
          {updateBrandingMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </CardContent>
    </Card>
  );
}


// Admin Prices Component
function AdminPrices() {
  const { data: packages, refetch: refetchPackages } = trpc.prices.getPackages.useQuery();
  const { data: addOns, refetch: refetchAddOns } = trpc.prices.getAddOns.useQuery();
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [editingAddOnId, setEditingAddOnId] = useState<number | null>(null);
  
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    displayName: '',
    basePrice: 0,
    cameraCount: '',
    cameraType: '',
    microphoneCount: '',
    microphoneType: '',
    operatorCount: '',
    targetAudience: '',
  });
  
  const [addOnFormData, setAddOnFormData] = useState({
    name: '',
    description: '',
    price: 0,
  });

  const updatePackageMutation = trpc.prices.updatePackage.useMutation({
    onSuccess: () => {
      toast.success("패키지가 업데이트되었습니다.");
      setEditingPackageId(null);
      refetchPackages();
    },
    onError: (error) => {
      toast.error(`업데이트 실패: ${error.message}`);
    },
  });

  const updateAddOnMutation = trpc.prices.updateAddOn.useMutation({
    onSuccess: () => {
      toast.success("추가 옵션이 업데이트되었습니다.");
      setEditingAddOnId(null);
      refetchAddOns();
    },
    onError: (error) => {
      toast.error(`업데이트 실패: ${error.message}`);
    },
  });

  const handleEditPackage = (pkg: any) => {
    setEditingPackageId(pkg.id);
    setPackageFormData({
      name: pkg.name || '',
      displayName: pkg.displayName,
      basePrice: pkg.basePrice,
      cameraCount: pkg.cameraCount || '',
      cameraType: pkg.cameraType || '',
      microphoneCount: pkg.microphoneCount || '',
      microphoneType: pkg.microphoneType || '',
      operatorCount: pkg.operatorCount || '',
      targetAudience: pkg.targetAudience || '',
    });
  };

  const handleSavePackage = () => {
    if (editingPackageId) {
      updatePackageMutation.mutate({
        id: editingPackageId,
        ...packageFormData,
      });
    }
  };

  const handleEditAddOn = (addon: any) => {
    setEditingAddOnId(addon.id);
    setAddOnFormData({
      name: addon.name,
      description: addon.description || '',
      price: addon.price,
    });
  };

  const handleSaveAddOn = () => {
    if (editingAddOnId) {
      updateAddOnMutation.mutate({
        id: editingAddOnId,
        ...addOnFormData,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Packages Section */}
      <Card>
        <CardHeader>
          <CardTitle>가격 패키지 관리</CardTitle>
          <CardDescription>
            서비스 패키지의 가격과 사양을 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {packages?.map((pkg) => (
            <Card key={pkg.id} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{pkg.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{pkg.targetAudience}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPackage(pkg)}
                  >
                    수정
                  </Button>
                </div>

                {editingPackageId === pkg.id && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>패키지 이름 (영문)</Label>
                        <Input
                          value={packageFormData.name}
                          onChange={(e) => setPackageFormData({...packageFormData, name: e.target.value})}
                          placeholder="예: Simple, Economy, Professional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>표시 이름</Label>
                        <Input
                          value={packageFormData.displayName}
                          onChange={(e) => setPackageFormData({...packageFormData, displayName: e.target.value})}
                          placeholder="예: Simple 패키지"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>기본 가격</Label>
                        <Input
                          type="number"
                          value={packageFormData.basePrice}
                          onChange={(e) => setPackageFormData({...packageFormData, basePrice: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>카메라 수량</Label>
                        <Input
                          value={packageFormData.cameraCount}
                          onChange={(e) => setPackageFormData({...packageFormData, cameraCount: e.target.value})}
                          placeholder="예: 5~6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>카메라 타입</Label>
                        <Input
                          value={packageFormData.cameraType}
                          onChange={(e) => setPackageFormData({...packageFormData, cameraType: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>마이크 수량</Label>
                        <Input
                          value={packageFormData.microphoneCount}
                          onChange={(e) => setPackageFormData({...packageFormData, microphoneCount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>마이크 타입</Label>
                        <Input
                          value={packageFormData.microphoneType}
                          onChange={(e) => setPackageFormData({...packageFormData, microphoneType: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>스탭 수량</Label>
                        <Input
                          value={packageFormData.operatorCount}
                          onChange={(e) => setPackageFormData({...packageFormData, operatorCount: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>대상 고객</Label>
                      <Textarea
                        value={packageFormData.targetAudience}
                        onChange={(e) => setPackageFormData({...packageFormData, targetAudience: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSavePackage}
                        disabled={updatePackageMutation.isPending}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingPackageId(null)}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Add-ons Section */}
      <Card>
        <CardHeader>
          <CardTitle>추가 옵션 관리</CardTitle>
          <CardDescription>
            추가 옵션의 가격을 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addOns?.map((addon) => (
            <Card key={addon.id} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{addon.name}</h4>
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAddOn(addon)}
                  >
                    수정
                  </Button>
                </div>

                {editingAddOnId === addon.id && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>옵션명</Label>
                      <Input
                        value={addOnFormData.name}
                        onChange={(e) => setAddOnFormData({...addOnFormData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>설명</Label>
                      <Input
                        value={addOnFormData.description}
                        onChange={(e) => setAddOnFormData({...addOnFormData, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>가격</Label>
                      <Input
                        type="number"
                        value={addOnFormData.price}
                        onChange={(e) => setAddOnFormData({...addOnFormData, price: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveAddOn}
                        disabled={updateAddOnMutation.isPending}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingAddOnId(null)}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
