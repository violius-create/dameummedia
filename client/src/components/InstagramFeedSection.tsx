import { trpc } from "@/lib/trpc";
import { Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Returns the number of visible columns based on screen width.
 * - Mobile (< 640px): min(displayCount, 2) → max 2
 * - Small tablet (640–767px): min(displayCount, 3) → max 3
 * - Tablet (768–1023px): min(displayCount, 4) → max 4
 * - Desktop (≥ 1024px): min(displayCount, 5) → max 5
 */
function useVisibleColumns(displayCount: number) {
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return Math.min(displayCount, 5);
    const w = window.innerWidth;
    if (w < 640) return Math.min(displayCount, 2);
    if (w < 768) return Math.min(displayCount, 3);
    if (w < 1024) return Math.min(displayCount, 4);
    return Math.min(displayCount, 5);
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setColumns(Math.min(displayCount, 2));
      else if (w < 768) setColumns(Math.min(displayCount, 3));
      else if (w < 1024) setColumns(Math.min(displayCount, 4));
      else setColumns(Math.min(displayCount, 5));
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [displayCount]);

  return columns;
}

export function InstagramFeedSection() {
  const { data: allPosts, isLoading } = trpc.instagramPosts.list.useQuery({ onlyActive: true });
  const { data: siteBranding } = trpc.siteBranding.get.useQuery();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const displayCount = siteBranding?.instagramDisplayCount ?? 10;
  const visibleColumns = useVisibleColumns(displayCount);
  const posts = allPosts ?? [];
  // Need scroll if total posts exceed what's visible on screen
  const needsScroll = posts.length > visibleColumns;

  // Check scroll position to show/hide buttons
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = setTimeout(() => updateScrollButtons(), 100);
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, posts.length, visibleColumns]);

  // Scroll exactly one card width
  const scrollByOneCard = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector("[data-insta-card]") as HTMLElement;
    if (!firstCard) return;
    const gap = 8; // gap-2 = 8px
    const cardWidth = firstCard.offsetWidth + gap;
    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  // Don't render section if no posts
  if (!isLoading && (!allPosts || allPosts.length === 0)) {
    return null;
  }

  const gapPx = 8; // gap-2

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
            {Array.from({ length: visibleColumns }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted animate-pulse rounded-sm"
              />
            ))}
          </div>
        )}

        {/* Instagram Grid */}
        {posts.length > 0 && (
          <div className="relative">
            <div
              ref={scrollRef}
              className={`flex gap-2 pb-2 ${needsScroll ? "overflow-x-auto scroll-smooth" : "overflow-hidden"}`}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {posts.map((post) => (
                <div
                  key={post.id}
                  data-insta-card
                  className="relative flex-shrink-0 aspect-square overflow-hidden rounded-sm group cursor-pointer"
                  style={{
                    width: `calc((100% - ${gapPx * (visibleColumns - 1)}px) / ${visibleColumns})`,
                  }}
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

            {/* Scroll Buttons */}
            {needsScroll && canScrollLeft && (
              <button
                onClick={() => scrollByOneCard("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
                aria-label="이전"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
            )}
            {needsScroll && canScrollRight && (
              <button
                onClick={() => scrollByOneCard("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
                aria-label="다음"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
