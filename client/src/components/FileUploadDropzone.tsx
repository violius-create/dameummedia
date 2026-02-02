import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FileUploadDropzoneProps {
  onUploadSuccess: (file: { url: string; fileName: string; fileKey: string }) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUploadDropzone({ 
  onUploadSuccess, 
  accept = "image/*,video/*",
  maxSize = 100 
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    fileName: string;
    url: string;
    fileKey: string;
    status: 'success' | 'error';
    message?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.upload.uploadFile.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`파일 크기가 ${maxSize}MB를 초과합니다.`);
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64String = (e.target?.result as string).split(',')[1];
        
        uploadMutation.mutate(
          {
            fileName: file.name,
            fileData: base64String,
            mimeType: file.type,
          },
          {
            onSuccess: (result) => {
              setUploadedFiles((prev) => [
                ...prev,
                {
                  fileName: result.fileName,
                  url: result.url,
                  fileKey: result.fileKey,
                  status: 'success',
                },
              ]);
              onUploadSuccess(result);
              toast.success(`${result.fileName} 업로드 완료`);
            },
            onError: (error) => {
              setUploadedFiles((prev) => [
                ...prev,
                {
                  fileName: file.name,
                  url: '',
                  fileKey: '',
                  status: 'error',
                  message: error.message,
                },
              ]);
              toast.error(`${file.name} 업로드 실패: ${error.message}`);
            },
          }
        );
      } catch (error) {
        toast.error("파일 읽기 실패");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => processFile(file));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => processFile(file));
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="pt-8 pb-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-2">
            파일을 여기로 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            최대 {maxSize}MB 크기의 이미지 또는 영상 파일
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            파일 선택
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-3 text-sm">업로드된 파일</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {file.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                      {file.status === 'success' ? (
                        <p className="text-xs text-muted-foreground truncate">{file.url}</p>
                      ) : (
                        <p className="text-xs text-red-600">{file.message}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
