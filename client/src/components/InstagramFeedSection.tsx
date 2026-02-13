import { trpc } from "@/lib/trpc";
import { Instagram } from "lucide-react";
import { useState } from "react";

export function InstagramFeedSection() {
  const { data: posts, isLoading } = trpc.instagramPosts.list.useQuery({ onlyActive: true });
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Don't render section if no posts
  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  return (
    <section className="bg-background border-t border-border overflow-hidden">
      <div className="container py-12">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <Instagram className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-bold tracking-tight">Instagram</h2>
          <a
            href="https://www.instagram.com/dameum_media"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            @dameum_media
          </a>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted animate-pulse rounded-sm"
              />
            ))}
          </div>
        )}

        {/* Instagram Grid */}
        {posts && posts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square overflow-hidden rounded-sm group cursor-pointer"
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (post.postUrl) {
                    window.open(post.postUrl, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Instagram post"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                    hoveredId === post.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {post.caption ? (
                    <p className="text-white text-xs sm:text-sm text-center px-3 line-clamp-3 font-medium">
                      {post.caption}
                    </p>
                  ) : (
                    <Instagram className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
