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

  const currentSettings = allSettings?.find(s => s.boardKey === selectedBoard);

  useEffect(() => {
    if (currentSettings) {
      setItemsPerPage(currentSettings.itemsPerPage);
      setDisplayMode(currentSettings.displayMode);
      setContainerWidth(currentSettings.containerWidth);
    } else {
      // Default values
      setItemsPerPage(12);
      setDisplayMode("gallery");
      setContainerWidth("container");
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
