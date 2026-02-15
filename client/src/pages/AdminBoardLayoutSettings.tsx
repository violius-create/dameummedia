import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// Helper: parse containerWidth from DB value to slider value
function parseContainerWidth(value: string): { isFull: boolean; px: number } {
  if (value === "full") return { isFull: true, px: 1280 };
  if (value === "container-wide") return { isFull: false, px: 1536 };
  if (value === "container") return { isFull: false, px: 1280 };
  // Try to parse px value like "1400px" or "1400"
  const num = parseInt(value);
  if (!isNaN(num) && num >= 600 && num <= 1920) return { isFull: false, px: num };
  return { isFull: false, px: 1280 };
}

// Helper: convert slider value back to DB value
function toContainerWidthValue(isFull: boolean, px: number): string {
  if (isFull) return "full";
  return `${px}px`;
}

// Helper: parse postWidth from DB value to slider value
function parsePostWidth(value: string): { isAuto: boolean; percent: number } {
  if (value === "auto" || !value) return { isAuto: true, percent: 33 };
  if (value === "full") return { isAuto: false, percent: 100 };
  if (value === "1/2") return { isAuto: false, percent: 50 };
  if (value === "1/3") return { isAuto: false, percent: 33 };
  if (value === "1/4") return { isAuto: false, percent: 25 };
  // Try to parse percent value like "40%" or "40"
  const num = parseInt(value);
  if (!isNaN(num) && num >= 10 && num <= 100) return { isAuto: false, percent: num };
  return { isAuto: true, percent: 33 };
}

// Helper: convert slider value back to DB value
function toPostWidthValue(isAuto: boolean, percent: number): string {
  if (isAuto) return "auto";
  return `${percent}%`;
}

export default function AdminBoardLayoutSettings() {
  const { user, isAuthenticated } = useAuth();
  const { data: allSettings, refetch } = trpc.boardLayoutSettings.list.useQuery();
  
  const [selectedBoard, setSelectedBoard] = useState("concert_live");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [displayMode, setDisplayMode] = useState("gallery");
  
  // Container width: slider + full toggle
  const [containerWidthPx, setContainerWidthPx] = useState(1280);
  const [isFullWidth, setIsFullWidth] = useState(false);
  
  // Post width: slider + auto toggle
  const [postWidthPercent, setPostWidthPercent] = useState(33);
  const [isAutoPostWidth, setIsAutoPostWidth] = useState(true);
  
  const [postHeight, setPostHeight] = useState("auto");
  const [postMarginTop, setPostMarginTop] = useState("0");
  const [postTitleSize, setPostTitleSize] = useState("base");

  const currentSettings = allSettings?.find(s => s.boardKey === selectedBoard);

  useEffect(() => {
    if (currentSettings) {
      setItemsPerPage(currentSettings.itemsPerPage);
      setDisplayMode(currentSettings.displayMode);
      
      const cw = parseContainerWidth(currentSettings.containerWidth);
      setContainerWidthPx(cw.px);
      setIsFullWidth(cw.isFull);
      
      const pw = parsePostWidth(currentSettings.postWidth || "auto");
      setPostWidthPercent(pw.percent);
      setIsAutoPostWidth(pw.isAuto);
      
      setPostHeight(currentSettings.postHeight || "auto");
      setPostMarginTop(currentSettings.postMarginTop || "0");
      setPostTitleSize(currentSettings.postTitleSize || "base");
    } else {
      setItemsPerPage(12);
      setDisplayMode("gallery");
      setContainerWidthPx(1280);
      setIsFullWidth(false);
      setPostWidthPercent(33);
      setIsAutoPostWidth(true);
      setPostHeight("auto");
      setPostMarginTop("0");
      setPostTitleSize("base");
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
      containerWidth: toContainerWidthValue(isFullWidth, containerWidthPx),
      postWidth: toPostWidthValue(isAutoPostWidth, postWidthPercent),
      postHeight,
      postMarginTop,
      postTitleSize,
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

  // Format display label for container width
  const containerWidthLabel = isFullWidth ? "전체 폭 (100%)" : `${containerWidthPx}px`;
  const postWidthLabel = isAutoPostWidth ? "자동 (기본)" : `${postWidthPercent}%`;

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

            {/* Container Width - Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>전체 폭</Label>
                <span className="text-sm font-medium text-primary">{containerWidthLabel}</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Switch
                  checked={isFullWidth}
                  onCheckedChange={setIsFullWidth}
                  id="fullWidthToggle"
                />
                <Label htmlFor="fullWidthToggle" className="text-sm text-muted-foreground cursor-pointer">
                  전체 폭 (100%) 사용
                </Label>
              </div>
              {!isFullWidth && (
                <div className="space-y-2">
                  <Slider
                    value={[containerWidthPx]}
                    onValueChange={(values) => setContainerWidthPx(values[0])}
                    min={600}
                    max={1920}
                    step={10}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>600px</span>
                    <span>1280px</span>
                    <span>1536px</span>
                    <span>1920px</span>
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                게시판 컨테이너의 최대 너비를 설정합니다.
              </p>
            </div>

            <div className="border-t pt-6 space-y-6">
              <h3 className="text-lg font-semibold">게시물 아이템 설정</h3>
              
              {/* Post Width - Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>게시물의 폭</Label>
                  <span className="text-sm font-medium text-primary">{postWidthLabel}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Switch
                    checked={isAutoPostWidth}
                    onCheckedChange={setIsAutoPostWidth}
                    id="autoPostWidthToggle"
                  />
                  <Label htmlFor="autoPostWidthToggle" className="text-sm text-muted-foreground cursor-pointer">
                    자동 (기본) 사용
                  </Label>
                </div>
                {!isAutoPostWidth && (
                  <div className="space-y-2">
                    <Slider
                      value={[postWidthPercent]}
                      onValueChange={(values) => setPostWidthPercent(values[0])}
                      min={10}
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
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
                      {setting.itemsPerPage}개 / {setting.displayMode === "gallery" ? "갤러리형" : "리스트형"} / {setting.containerWidth} / 게시물폭: {setting.postWidth || "auto"}
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
