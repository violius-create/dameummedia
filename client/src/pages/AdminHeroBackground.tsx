import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Upload, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'wouter';

type SectionType = 'main' | 'section2' | 'section3';

export default function AdminHeroBackground() {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState<SectionType>('main');
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [heroTitle, setHeroTitle] = useState('담음미디어');
  const [heroSubtitle, setHeroSubtitle] = useState('Professional Media Production');
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const [savingSettings, setSavingSettings] = useState(false);

  const uploadMutation = trpc.upload.uploadFile.useMutation();
  const createGalleryMutation = trpc.gallery.create.useMutation();
  const createHeroBackgroundMutation = trpc.heroBackground.create.useMutation();
  const updateHeroBackgroundMutation = trpc.heroBackground.update.useMutation();
  const { data: heroBackgrounds, refetch } = trpc.heroBackground.list.useQuery({});

  // 관리자 권한 확인
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-2xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600">접근 권한이 없습니다</h1>
            <p className="text-muted-foreground mt-2">관리자만 접근할 수 있습니다.</p>
            <Link href="/">
              <Button className="mt-4">홈으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !title) {
      alert('제목과 영상을 선택해주세요.');
      return;
    }

    setUploading(true);
    
    // 클로저 문제를 피하기 위해 현재 값을 저장
    const currentTitle = title;
    const currentFile = videoFile;
    const currentSection = selectedSection;
    
    // 파일을 base64로 변환
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string).split(',')[1];
        
        // 파일 업로드
        const uploadResult = await uploadMutation.mutateAsync({
          fileName: currentFile.name,
          fileData: base64,
          mimeType: currentFile.type,
        });

        // heroBackground 생성
        await createHeroBackgroundMutation.mutateAsync({
          title: currentTitle,
          type: 'video',
          mediaUrl: uploadResult.url,
          fileKey: uploadResult.fileKey,
          isActive: 1,
          section: currentSection,
        });

        alert(`${currentSection === 'main' ? '메인' : currentSection === 'section2' ? '섹션 2' : '섹션 3'} 배경 영상이 업로드되었습니다.`);
        setTitle('');
        setVideoFile(null);
        setPreview('');
        setUploading(false);
        refetch();
      } catch (error) {
        setUploading(false);
        alert(`업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    };
    
    reader.onerror = () => {
      setUploading(false);
      alert('파일 읽기 실패');
    };
    
    reader.readAsDataURL(currentFile);
  };

  const getSectionLabel = (section: SectionType) => {
    switch (section) {
      case 'main':
        return '메인 배경 영상';
      case 'section2':
        return '섹션 2 배경 영상';
      case 'section3':
        return '섹션 3 배경 영상';
    }
  };

  const getSectionDescription = (section: SectionType) => {
    switch (section) {
      case 'main':
        return '메인 페이지 최상단에 표시될 배경 영상을 업로드하세요.';
      case 'section2':
        return '메인 페이지 중간에 표시될 배경 영상을 업로드하세요.';
      case 'section3':
        return '메인 페이지 하단에 표시될 배경 영상을 업로드하세요.';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  관리자 메뉴
                </Button>
              </Link>
            </div>
            <h1 className="text-lg font-bold">배경 영상 관리</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="container max-w-4xl py-8">
        {/* 섹션 선택 탭 */}
        <div className="flex gap-2 mb-8">
          {(['main', 'section2', 'section3'] as SectionType[]).map((section) => (
            <Button
              key={section}
              variant={selectedSection === section ? 'default' : 'outline'}
              onClick={() => setSelectedSection(section)}
              className="flex-1"
            >
              {getSectionLabel(section)}
            </Button>
          ))}
        </div>

        {/* 업로드 폼 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{getSectionLabel(selectedSection)} 업로드</CardTitle>
            <CardDescription>{getSectionDescription(selectedSection)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 제목 입력 */}
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="배경 영상 제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* 파일 선택 */}
              <div>
                <Label htmlFor="video">영상 파일 선택</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  지원 형식: MP4, WebM, Ogg 등
                </p>
              </div>

              {/* 미리보기 */}
              {preview && (
                <div>
                  <Label>미리보기</Label>
                  <video
                    src={preview}
                    controls
                    className="w-full h-64 bg-black rounded-lg mt-2"
                  />
                </div>
              )}

              {/* 업로드 버튼 */}
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {getSectionLabel(selectedSection)} 업로드
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 타이틀 및 오버레이 설정 (메인 섹션만) */}
        {selectedSection === 'main' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>타이틀 및 오버레이 설정</CardTitle>
              <CardDescription>메인 페이지 타이틀과 배경 영상 오버레이를 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 타이틀 입력 */}
                <div>
                  <Label htmlFor="heroTitle">메인 타이틀</Label>
                  <Input
                    id="heroTitle"
                    placeholder="메인 타이틀"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* 부제 입력 */}
                <div>
                  <Label htmlFor="heroSubtitle">부제</Label>
                  <Input
                    id="heroSubtitle"
                    placeholder="부제"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* 오버레이 투명도 조정 */}
                <div>
                  <Label htmlFor="overlayOpacity">오버레이 투명도: {overlayOpacity}%</Label>
                  <input
                    id="overlayOpacity"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">0%: 투명 (영상 선명), 100%: 불투명 (검은색)</p>
                </div>

                {/* 미리보기 */}
                <div>
                  <Label>미리보기</Label>
                  <div 
                    className="w-full h-48 bg-black rounded-lg mt-2 flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundColor: '#000000',
                    }}
                  >
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`,
                      }}
                    >
                      <div className="text-center text-white">
                        <h1 className="text-4xl font-bold mb-2">{heroTitle}</h1>
                        <p className="text-xl text-gray-200">{heroSubtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <Button
                  onClick={() => {
                    setSavingSettings(true);
                    // 로컬 스토리지에 저장 (임시 방식)
                    localStorage.setItem('heroTitle', heroTitle);
                    localStorage.setItem('heroSubtitle', heroSubtitle);
                    localStorage.setItem('overlayOpacity', String(overlayOpacity));
                    setTimeout(() => {
                      setSavingSettings(false);
                      alert('설정이 저장되었습니다.');
                    }, 500);
                  }}
                  disabled={savingSettings}
                  className="w-full"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '설정 저장'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 업로드된 배경 영상 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>업로드된 배경 영상</CardTitle>
            <CardDescription>{getSectionLabel(selectedSection)} 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {heroBackgrounds && heroBackgrounds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroBackgrounds
                  .filter((item) => (item as any).section === selectedSection)
                  .map((item) => (
                    <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                      {item.type === 'video' ? (
                        <video
                          src={item.mediaUrl}
                          controls
                          className="w-full h-40 bg-black object-cover"
                        />
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.type === 'video' ? '영상' : '이미지'}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={item.isActive === 1 ? "default" : "outline"}
                            onClick={async () => {
                              await updateHeroBackgroundMutation.mutateAsync({
                                id: item.id,
                                isActive: item.isActive === 1 ? 0 : 1,
                              });
                              refetch();
                            }}
                            disabled={updateHeroBackgroundMutation.isPending}
                            className="flex-1"
                          >
                            {item.isActive === 1 ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                활성화됨
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4 mr-1" />
                                비활성화
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                업로드된 배경 영상이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
