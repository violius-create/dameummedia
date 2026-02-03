import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';

const SERVICE_ITEMS = [
  { key: 'classy_live_filming', label: 'Classy live filming' },
  { key: 'profile_music_video', label: 'Profile-Music video' },
  { key: 'planned_shooting', label: 'Planned shooting' },
];

export default function AdminServiceItems() {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingItems, setUploadingItems] = useState<Record<string, boolean>>({});

  const { data: items, refetch } = trpc.serviceItems.list.useQuery({ limit: 100 });
  const uploadMutation = trpc.upload.uploadFile.useMutation();
  const updateMutation = trpc.serviceItems.update.useMutation();

  const handleFileSelect = (itemKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [itemKey]: file }));
    }
  };

  const handleUpload = async (itemKey: string) => {
    const file = selectedFiles[itemKey];
    const description = descriptions[itemKey] || '';

    if (!file && !description) {
      alert('Please select a file or enter a description');
      return;
    }

    setUploadingItems(prev => ({ ...prev, [itemKey]: true }));
    try {
      const item = items?.find(i => i.itemKey === itemKey);
      if (!item) {
        alert('Service item not found');
        setUploadingItems(prev => ({ ...prev, [itemKey]: false }));
        return;
      }

      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64Data = (e.target?.result as string).split(',')[1];
            
            const uploadResult = await uploadMutation.mutateAsync({
              fileName: `service-item-${itemKey}-${Date.now()}-${file.name}`,
              fileData: base64Data,
              mimeType: file.type,
            });

            const mediaUrl = uploadResult.url;
            const fileKey = uploadResult.fileKey;
            const fileType = file.type.startsWith('video/') ? 'video' : 'image';

            await updateMutation.mutateAsync({
              id: item.id,
              description: description || item.description || undefined,
              mediaUrl: mediaUrl,
              fileKey: fileKey,
              type: fileType,
            });

            setSelectedFiles(prev => ({ ...prev, [itemKey]: null }));
            setDescriptions(prev => ({ ...prev, [itemKey]: '' }));
            refetch();
            alert('Service item updated successfully!');
          } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to update service item');
          } finally {
            setUploadingItems(prev => ({ ...prev, [itemKey]: false }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        await updateMutation.mutateAsync({
          id: item.id,
          description: description,
        });

        setDescriptions(prev => ({ ...prev, [itemKey]: '' }));
        refetch();
        alert('Service item updated successfully!');
        setUploadingItems(prev => ({ ...prev, [itemKey]: false }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to update service item');
      setUploadingItems(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Service Items Management</h1>
        <p className="text-muted-foreground">Manage your 3 service items</p>
      </div>

      <div className="grid gap-6">
        {SERVICE_ITEMS.map(({ key, label }) => {
          const item = items?.find(i => i.itemKey === key);
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
                {item?.mediaUrl && (
                  <CardDescription>
                    Current media: {item.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {item?.mediaUrl && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Current Media</p>
                    {item.type === 'video' ? (
                      <video
                        src={item.mediaUrl}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={label}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Enter description..."
                    value={descriptions[key] || item?.description || ''}
                    onChange={(e) => setDescriptions(prev => ({ ...prev, [key]: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Update Media (optional)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileSelect(key, e)}
                      className="flex-1"
                    />
                    {selectedFiles[key] && selectedFiles[key] !== null && (
                      <span className="text-sm text-green-600">✓ {selectedFiles[key].name}</span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleUpload(key)}
                  disabled={uploadingItems[key]}
                  className="w-full"
                >
                  {uploadingItems[key] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Update Service Item
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
