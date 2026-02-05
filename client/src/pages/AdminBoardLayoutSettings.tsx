import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminBoardLayoutSettings() {
  const { user, isAuthenticated } = useAuth();
  const { data: allSettings, refetch } = trpc.boardLayoutSettings.list.useQuery();
  
  const [selectedBoard, setSelectedBoard] = useState("concert_live");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [displayMode, setDisplayMode] = useState("gallery");
  const [containerWidth, setContainerWidth] = useState("container");
  const [postWidth, setPostWidth] = useState("auto");
  const [postHeight, setPostHeight] = useState("auto");
  const [postMarginTop, setPostMarginTop] = useState("0");
  const [postTitleSize, setPostTitleSize] = useState("base");
  const [boardTitleSize, setBoardTitleSize] = useState("4xl");
  const [boardTitleMarginTop, setBoardTitleMarginTop] = useState("0");

  const currentSettings = allSettings?.find(s => s.boardKey === selectedBoard);

  useEffect(() => {
    if (currentSettings) {
      setItemsPerPage(currentSettings.itemsPerPage);
      setDisplayMode(currentSettings.displayMode);
      setContainerWidth(currentSettings.containerWidth);
      setPostWidth(currentSettings.postWidth || "auto");
      setPostHeight(currentSettings.postHeight || "auto");
      setPostMarginTop(currentSettings.postMarginTop || "0");
      setPostTitleSize(currentSettings.postTitleSize || "base");
      setBoardTitleSize(currentSettings.boardTitleSize || "4xl");
      setBoardTitleMarginTop(currentSettings.boardTitleMarginTop || "0");
    } else {
      // Default values
      setItemsPerPage(12);
      setDisplayMode("gallery");
      setContainerWidth("container");
      setPostWidth("auto");
      setPostHeight("auto");
      setPostMarginTop("0");
      setPostTitleSize("base");
      setBoardTitleSize("4xl");
      setBoardTitleMarginTop("0");
    }
  }, [currentSettings, selectedBoard]);

  const updateMutation = trpc.boardLayoutSettings.update.useMutation({
    onSuccess: () => {
      toast.success("레이아웃 설정이 저장되었습니다.");
      refetch();
    },
    onError: (error) => {
      toast.error(`저장 실패: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      boardKey: selectedBoard,
      itemsPerPage,
      displayMode,
      containerWidth,
      postWidth,
      postHeight,
      postMarginTop,
      postTitleSize,
      boardTitleSize,
      boardTitleMarginTop,
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>관리자만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">게시판 레이아웃 설정</h1>
          <Link href="/admin">
            <Button variant="outline">
              돌아가기
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>게시판/갤러리 표시 설정</CardTitle>
            <CardDescription>
              각 게시판의 게시물 개수, 표시 방법, 전체 폭을 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="boardKey">게시판 선택</Label>
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concert_live">Concert Live</SelectItem>
                  <SelectItem value="making_film">Making Film</SelectItem>
                  <SelectItem value="reservation">예약 게시판</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">페이지당 게시물 개수</Label>
              <Input
                id="itemsPerPage"
                type="number"
                min="1"
                max="100"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value) || 12)}
              />
              <p className="text-sm text-muted-foreground">
                한 페이지에 표시할 게시물 개수 (1-100)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayMode">표시 방법</Label>
              <Select value={displayMode} onValueChange={setDisplayMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gallery">갤러리형 (썸네일 그리드)</SelectItem>
                  <SelectItem value="list">리스트형 (목록)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                게시물을 표시하는 방식을 선택합니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerWidth">전체 폭</Label>
              <Select value={containerWidth} onValueChange={setContainerWidth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="container">기본 (1280px)</SelectItem>
                  <SelectItem value="container-wide">넓게 (1536px)</SelectItem>
                  <SelectItem value="full">전체 폭</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                게시판 컨테이너의 최대 너비를 설정합니다.
              </p>
            </div>

            <div className="border-t pt-6 space-y-6">
              <h3 className="text-lg font-semibold">게시물 아이템 설정</h3>
              
              <div className="space-y-2">
                <Label htmlFor="postWidth">게시물의 폭</Label>
                <Select value={postWidth} onValueChange={setPostWidth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">자동 (기본)</SelectItem>
                    <SelectItem value="full">전체 폭 (100%)</SelectItem>
                    <SelectItem value="1/2">1/2 (50%)</SelectItem>
                    <SelectItem value="1/3">1/3 (33%)</SelectItem>
                    <SelectItem value="1/4">1/4 (25%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  각 게시물 카드의 너비를 설정합니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postHeight">게시물의 높이</Label>
                <Input
                  id="postHeight"
                  type="text"
                  value={postHeight}
                  onChange={(e) => setPostHeight(e.target.value)}
                  placeholder="auto, 300px, 20rem 등"
                />
                <p className="text-sm text-muted-foreground">
                  각 게시물 카드의 높이를 설정합니다. (auto, 300px, 20rem 등)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postMarginTop">게시물의 위쪽 여백</Label>
                <Input
                  id="postMarginTop"
                  type="text"
                  value={postMarginTop}
                  onChange={(e) => setPostMarginTop(e.target.value)}
                  placeholder="0, 1rem, -0.5rem 등"
                />
                <p className="text-sm text-muted-foreground">
                  각 게시물 카드의 위쪽 여백을 설정합니다. (0, 1rem, 2rem, -0.5rem, -1rem 등 음수 가능)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postTitleSize">게시물의 타이틀 사이즈</Label>
                <Select value={postTitleSize} onValueChange={setPostTitleSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">매우 작게 (xs)</SelectItem>
                    <SelectItem value="sm">작게 (sm)</SelectItem>
                    <SelectItem value="base">기본 (base)</SelectItem>
                    <SelectItem value="lg">크게 (lg)</SelectItem>
                    <SelectItem value="xl">매우 크게 (xl)</SelectItem>
                    <SelectItem value="2xl">매우 매우 크게 (2xl)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  각 게시물 카드의 제목 크기를 설정합니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boardTitleSize">게시판 제목 크기</Label>
                <Select value={boardTitleSize} onValueChange={setBoardTitleSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2xl">작게 (2xl)</SelectItem>
                    <SelectItem value="3xl">보통 (3xl)</SelectItem>
                    <SelectItem value="4xl">크게 (4xl)</SelectItem>
                    <SelectItem value="5xl">매우 크게 (5xl)</SelectItem>
                    <SelectItem value="6xl">매우 매우 크게 (6xl)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  게시판 상단의 제목 (Concert Live, Making Film 등) 크기를 설정합니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boardTitleMarginTop">게시판 제목 위쪽 여백</Label>
                <Input
                  id="boardTitleMarginTop"
                  type="text"
                  value={boardTitleMarginTop}
                  onChange={(e) => setBoardTitleMarginTop(e.target.value)}
                  placeholder="0, 1rem, -0.5rem 등"
                />
                <p className="text-sm text-muted-foreground">
                  게시판 상단 제목의 위쪽 여백을 설정합니다. (0, 1rem, 2rem, -0.5rem, -1rem 등 음수 가능)
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>현재 설정 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {allSettings && allSettings.length > 0 ? (
                allSettings.map((setting) => (
                  <div key={setting.id} className="flex justify-between border-b pb-2">
                    <span className="font-medium">
                      {setting.boardKey === "concert_live" && "Concert Live"}
                      {setting.boardKey === "making_film" && "Making Film"}
                      {setting.boardKey === "reservation" && "예약 게시판"}
                    </span>
                    <span className="text-muted-foreground">
                      {setting.itemsPerPage}개 / {setting.displayMode === "gallery" ? "갤러리형" : "리스트형"} / {setting.containerWidth}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">설정된 게시판이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
