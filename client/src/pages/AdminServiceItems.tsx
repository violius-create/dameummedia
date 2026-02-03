import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Upload, Loader2 } from 'lucide-react';

export default function AdminServiceItems() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: items, refetch } = trpc.serviceItems.list.useQuery({ limit: 100 });
  const uploadMutation = trpc.upload.uploadFile.useMutation();
  const createMutation = trpc.serviceItems.create.useMutation();
  const deleteMutation = trpc.serviceItems.delete.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const isVideo = file.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'image');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      alert('Please select a file and enter a title');
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        
        // Upload file to S3
        const uploadResult = await uploadMutation.mutateAsync({
          fileName: `service-item-${Date.now()}-${selectedFile.name}`,
          fileData: base64Data,
          mimeType: selectedFile.type,
        });

        // Create service item
        await createMutation.mutateAsync({
          title,
          description,
          type: fileType,
          mediaUrl: uploadResult.url,
          fileKey: uploadResult.fileKey,
          thumbnailUrl: uploadResult.url,
        });

        // Reset form
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        setFileType('image');
        refetch();
        alert('Service item created successfully!');
        setIsUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service item?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      alert('Service item deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Service Items Management</h1>

        {/* Upload Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Service Item</CardTitle>
            <CardDescription>Add a new service item with image or video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Classy live filming"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">File</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name} ({fileType})
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !title}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Service Item
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Service Items</CardTitle>
            <CardDescription>Manage your service items</CardDescription>
          </CardHeader>
          <CardContent>
            {!items || items.length === 0 ? (
              <p className="text-gray-500">No service items yet</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Type: {item.type} | Status: {item.status}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
