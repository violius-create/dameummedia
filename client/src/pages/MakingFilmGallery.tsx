import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Film, Play, X } from "lucide-react";
import { useLocation } from "wouter";

export default function MakingFilmGallery() {
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const { data: galleryItems, isLoading } = trpc.gallery.list.useQuery({
    category: "film",
    limit: 100,
  });

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowLightbox(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Making Film Gallery</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation('/')}>돌아가기</Button>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">영화 제작 갤러리</h2>
          <p className="text-lg text-muted-foreground">
            담음미디어의 영화 제작 과정, 촬영 장면, 그리고 완성된 작품들을 소개합니다.
          </p>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">갤러리를 불러오는 중...</p>
          </div>
        ) : galleryItems && galleryItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {item.type === "video" ? (
                    <>
                      <img
                        src={item.thumbnailUrl || "/placeholder.jpg"}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all group-hover:bg-black/50">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {item.featured === 1 && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-muted-foreground">
                    {item.type === "video" ? "🎬 영상" : "📷 사진"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 갤러리 콘텐츠가 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            {selectedItem?.description && (
              <DialogDescription>{selectedItem.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="relative">
            {selectedItem?.type === "video" ? (
              <iframe
                width="100%"
                height="500"
                src={selectedItem.mediaUrl}
                title={selectedItem?.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                src={selectedItem?.mediaUrl}
                alt={selectedItem?.title}
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
