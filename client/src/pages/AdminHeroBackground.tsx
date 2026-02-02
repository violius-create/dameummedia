import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminHeroBackground() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');

  const uploadMutation = trpc.upload.uploadFile.useMutation();
  const createGalleryMutation = trpc.gallery.create.useMutation();
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
    try {
      // 파일을 base64로 변환
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        
        // 파일 업로드
        const uploadResult = await uploadMutation.mutateAsync({
          fileName: videoFile.name,
          fileData: base64,
          mimeType: videoFile.type,
        });

        // 갤러리 아이템 생성 (hero-background 카테고리로)
        await createGalleryMutation.mutateAsync({
          title,
          description: '배경 영상',
          type: 'video',
          category: 'concert', // 임시로 concert 사용
          mediaUrl: uploadResult.url,
          fileKey: uploadResult.fileKey,
          order: 0,
          featured: 1,
        });

        alert('배경 영상이 업로드되었습니다.');
        setTitle('');
        setVideoFile(null);
        setPreview('');
        refetch();
      };
      reader.readAsDataURL(videoFile);
    } catch (error) {
      alert(`업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setUploading(false);
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
        {/* 업로드 폼 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>배경 영상 업로드</CardTitle>
            <CardDescription>메인 페이지 최상단에 표시될 배경 영상을 업로드하세요.</CardDescription>
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
                disabled={uploading || !videoFile || !title}
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
                    배경 영상 업로드
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 업로드된 배경 영상 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>업로드된 배경 영상</CardTitle>
            <CardDescription>현재 등록된 배경 영상 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {heroBackgrounds && heroBackgrounds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroBackgrounds.map((item) => (
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
                      {item.isActive === 1 && (
                        <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          활성화됨
                        </div>
                      )}
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
