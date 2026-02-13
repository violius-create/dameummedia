import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, GripVertical, Eye, EyeOff, Instagram } from "lucide-react";

export default function AdminInstagramPosts() {
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [imageUrl, setImageUrl] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPostUrl, setEditPostUrl] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);

  const { data: posts, refetch } = trpc.instagramPosts.list.useQuery({ onlyActive: false });

  const createMutation = trpc.instagramPosts.create.useMutation({
    onSuccess: () => {
      toast.success("인스타그램 게시물이 추가되었습니다.");
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`추가 실패: ${error.message}`);
    },
  });

  const updateMutation = trpc.instagramPosts.update.useMutation({
    onSuccess: () => {
      toast.success("게시물이 수정되었습니다.");
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`수정 실패: ${error.message}`);
    },
  });

  const deleteMutation = trpc.instagramPosts.delete.useMutation({
    onSuccess: () => {
      toast.success("게시물이 삭제되었습니다.");
      refetch();
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  const resetForm = () => {
    setImageUrl("");
    setFileKey("");
    setPostUrl("");
    setCaption("");
    setSortOrder(0);
    setShowAddForm(false);
  };

  const handleCreate = () => {
    if (!imageUrl) {
      toast.error("이미지를 업로드해주세요.");
      return;
    }
    createMutation.mutate({
      imageUrl,
      fileKey: fileKey || undefined,
      postUrl: postUrl || undefined,
      caption: caption || undefined,
      sortOrder,
      isActive: 1,
    });
  };

  const handleToggleActive = (id: number, currentActive: number) => {
    updateMutation.mutate({
      id,
      isActive: currentActive === 1 ? 0 : 1,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("이 게시물을 삭제하시겠습니까?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleStartEdit = (post: any) => {
    setEditingId(post.id);
    setEditPostUrl(post.postUrl || "");
    setEditCaption(post.caption || "");
    setEditSortOrder(post.sortOrder);
  };

  const handleSaveEdit = (id: number) => {
    updateMutation.mutate({
      id,
      postUrl: editPostUrl || undefined,
      caption: editCaption || undefined,
      sortOrder: editSortOrder,
    });
  };

  const handleMoveUp = (post: any, index: number) => {
    if (!posts || index === 0) return;
    const prevPost = posts[index - 1];
    // Swap sort orders
    updateMutation.mutate({ id: post.id, sortOrder: prevPost.sortOrder });
    updateMutation.mutate({ id: prevPost.id, sortOrder: post.sortOrder });
  };

  const handleMoveDown = (post: any, index: number) => {
    if (!posts || index === posts.length - 1) return;
    const nextPost = posts[index + 1];
    // Swap sort orders
    updateMutation.mutate({ id: post.id, sortOrder: nextPost.sortOrder });
    updateMutation.mutate({ id: nextPost.id, sortOrder: post.sortOrder });
  };

  if (!isAuthenticated || user?.role !== "admin") {
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
          <div>
            <h1 className="text-3xl font-bold">Instagram 게시물 관리</h1>
            <p className="text-muted-foreground mt-1">
              메인 페이지에 표시할 Instagram 게시물을 직접 등록하고 관리합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              돌아가기
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              게시물 추가
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>새 Instagram 게시물 추가</CardTitle>
              <CardDescription>
                Instagram에서 공유하고 싶은 이미지를 업로드하고 링크를 입력하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>이미지 업로드</Label>
                {imageUrl ? (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={imageUrl}
                      alt="미리보기"
                      className="w-48 h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => { setImageUrl(""); setFileKey(""); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <FileUploadDropzone
                    accept="image/*"
                    maxSize={10}
                    onUploadSuccess={(file) => {
                      setImageUrl(file.url);
                      setFileKey(file.fileKey);
                    }}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="postUrl">Instagram 게시물 링크 (선택)</Label>
                <Input
                  id="postUrl"
                  placeholder="https://www.instagram.com/p/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="caption">캡션 / 설명 (선택)</Label>
                <Textarea
                  id="caption"
                  placeholder="게시물에 대한 간단한 설명..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="sortOrder">정렬 순서</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  숫자가 작을수록 앞에 표시됩니다.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "저장 중..." : "저장"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts?.map((post, index) => (
            <Card
              key={post.id}
              className={`overflow-hidden ${post.isActive === 0 ? "opacity-50" : ""}`}
            >
              <div className="relative aspect-square">
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Instagram post"}
                  className="w-full h-full object-cover"
                />
                {/* Overlay controls */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/80 hover:bg-white"
                    onClick={() => handleToggleActive(post.id, post.isActive)}
                    title={post.isActive === 1 ? "숨기기" : "표시하기"}
                  >
                    {post.isActive === 1 ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  #{post.sortOrder}
                </div>
              </div>

              {editingId === post.id ? (
                <CardContent className="p-3 space-y-2">
                  <Input
                    placeholder="Instagram 링크"
                    value={editPostUrl}
                    onChange={(e) => setEditPostUrl(e.target.value)}
                    className="text-xs"
                  />
                  <Textarea
                    placeholder="캡션"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <Input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(parseInt(e.target.value) || 0)}
                    className="text-xs w-20"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleSaveEdit(post.id)}>
                      저장
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      취소
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="p-3">
                  {post.caption && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {post.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveUp(post, index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveDown(post, index)}
                        disabled={index === (posts?.length || 0) - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      {post.postUrl && (
                        <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleStartEdit(post)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(!posts || posts.length === 0) && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <Instagram className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">등록된 게시물이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                "게시물 추가" 버튼을 클릭하여 Instagram 이미지를 등록하세요.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                첫 게시물 추가하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
