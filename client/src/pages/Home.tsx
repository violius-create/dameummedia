import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Music, Film, Calendar, Mail, Phone, MapPin, LogOut, Play, Search, Instagram, Youtube } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [heroTitle, setHeroTitle] = useState('담음미디어');
  const [heroSubtitle, setHeroSubtitle] = useState('Professional Media Production');
  const [heroDescription, setHeroDescription] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const { data: concertPosts } = trpc.posts.list.useQuery({ category: 'concert', limit: 6 });
  const { data: filmPosts } = trpc.posts.list.useQuery({ category: 'film', limit: 6 });
  const { data: activeHeroBackground } = trpc.heroBackground.getActive.useQuery();
  const { data: heroBackgrounds } = trpc.heroBackground.list.useQuery({});
  const { data: siteBranding } = trpc.siteBranding.get.useQuery();
  const { data: allSectionTitles } = trpc.sectionTitles.list.useQuery();
  const [sections, setSections] = useState<Record<string, { title: string; description: string }>>({});
  
  useEffect(() => {
    console.log("activeHeroBackground:", activeHeroBackground);
    console.log("heroBackgrounds:", heroBackgrounds);
  }, [activeHeroBackground, heroBackgrounds]);

  // siteBranding 데이터 로드
  useEffect(() => {
    if (siteBranding) {
      setHeroSubtitle(siteBranding.subtitle || 'Professional Media Production');
    }
  }, [siteBranding]);

  // 활성화된 메인 배경 영상의 제목과 설명 로드
  useEffect(() => {
    if (activeHeroBackground) {
      if (activeHeroBackground.title) {
        setHeroTitle(activeHeroBackground.title);
      }
      if (activeHeroBackground.description) {
        setHeroDescription(activeHeroBackground.description);
      }
    }
  }, [activeHeroBackground]);

  // 섹션 제목 데이터 로드
  useEffect(() => {
    if (allSectionTitles) {
      const sectionMap: Record<string, any> = {};
      allSectionTitles.forEach((section: any) => {
        sectionMap[section.sectionKey] = {
          title: section.title,
          description: section.description || '',
        };
      });
      setSections(sectionMap);
    }
  }, [allSectionTitles]);

  // 로컬 스토리지에서 설정 로드
  useEffect(() => {
    const savedTitle = localStorage.getItem('heroTitle');
    const savedSubtitle = localStorage.getItem('heroSubtitle');
    const savedOpacity = localStorage.getItem('overlayOpacity');
    
    if (savedTitle) setHeroTitle(savedTitle);
    if (savedSubtitle) setHeroSubtitle(savedSubtitle);
    if (savedOpacity) setOverlayOpacity(Number(savedOpacity));
  }, []);

  return (
    <div className="min-h-screen bg-background">


      {/* Main Navigation Bar - White Background */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="container py-4 flex items-center justify-between">
          {/* Left: Logo - Hidden */}
          <div className="flex items-center gap-3">
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/information">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-gray-300 hover:text-white">Information</Button>
            </Link>
            <Link href="/price">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-gray-300 hover:text-white">Price</Button>
            </Link>
            <Link href="/concert-live">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-gray-300 hover:text-white">Concert Live</Button>
            </Link>
            <Link href="/making-film">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-gray-300 hover:text-white">Making Film</Button>
            </Link>
            <Link href="/reservation">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-gray-300 hover:text-white">Reservation</Button>
            </Link>
          </div>

          {/* Right: Search and Admin */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
              <Search className="h-4 w-4" />
            </Button>
            {isAuthenticated && user?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="text-foreground">Admin</Button>
              </Link>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-accent"
                onClick={() => {
                  trpc.auth.logout.useMutation().mutate();
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Full Screen Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-black">
        <div className="relative w-full h-full">
          {/* Background Media - Full Screen */}
          {activeHeroBackground?.mediaUrl ? (
            activeHeroBackground.type === 'video' ? (
              <video
                key={`video-${activeHeroBackground.id}`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src={activeHeroBackground.mediaUrl}
              />
            ) : (
              <img
                key={`img-${activeHeroBackground.id}`}
                className="w-full h-full object-cover"
                src={activeHeroBackground.mediaUrl}
                alt="Hero Background"
              />
            )
          ) : (
            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=1200&fit=crop"
              alt="Professional Music Production"
            />
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          {/* Text Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-16 z-10">
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
              </div>
              <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-none mb-4">
                  {heroTitle}
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full" />
              </div>
              {heroDescription && (
                <p className="text-lg md:text-2xl text-gray-100 leading-relaxed max-w-2xl font-light animate-fade-in" style={{animationDelay: '0.6s'}}>
                  {heroDescription}
                </p>
              )}
            </div>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer border border-white/30">
              <Play className="w-10 h-10 text-white fill-white" />
            </div>
          </div>
        </div>
      </section>



      {/* Additional Hero Sections - Section 2 and 3 */}
      {/* Section 2 and 3 - Side by Side Grid */}
      {heroBackgrounds && heroBackgrounds.length > 0 && (
        <div className="grid grid-cols-2 gap-[10px] bg-white mt-[10px]">
          {['section2', 'section3'].map((section) => {
            const sectionBg = heroBackgrounds.find((bg: any) => bg.section === section && bg.isActive === 1);
            if (!sectionBg) return null;
            
            return (
              <div key={section} className="relative h-[350px] overflow-hidden">
                {/* Media */}
                <div className="relative w-full h-full">
                  {sectionBg.type === 'video' ? (
                    <video
                      key={`video-${sectionBg.id}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      src={sectionBg.mediaUrl}
                    />
                  ) : (
                    <img
                      key={`img-${sectionBg.id}`}
                      className="w-full h-full object-cover"
                      src={sectionBg.mediaUrl}
                      alt={sectionBg.title}
                    />
                  )}
                  
                  {/* Text Overlay on Media */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex flex-col justify-center p-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                      {sectionBg.title || (section === 'section2' ? '공연 영상' : '영상 제작')}
                    </h2>
                    {sectionBg.description && (
                      <p className="text-sm text-gray-100 line-clamp-2">
                        {sectionBg.description}
                      </p>
                    )}
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer border border-white/30">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Concert Live Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-24">
          <div className="mb-12">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">{sections['concert_live']?.title || '공연 영상'}</h2>
            <p className="text-lg text-muted-foreground">{sections['concert_live']?.description || '최근 췍영된 공연 영상'}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {concertPosts?.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="group relative overflow-hidden rounded-lg h-64 bg-gray-200 cursor-pointer">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <Music className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Text Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-lg line-clamp-2">{post.title}</h3>
                    {post.content && (
                      <p className="text-gray-200 text-sm line-clamp-2 mt-2">{post.content}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Making Film Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-24">
          <div className="mb-12">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">{sections['making_film']?.title || '영상 제작'}</h2>
            <p className="text-lg text-muted-foreground">{sections['making_film']?.description || '최근 제작된 영상 콘테나'}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filmPosts?.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="group relative overflow-hidden rounded-lg h-64 bg-gray-200 cursor-pointer">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <Film className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Text Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-lg line-clamp-2">{post.title}</h3>
                    {post.content && (
                      <p className="text-gray-200 text-sm line-clamp-2 mt-2">{post.content}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-border text-white">
        <div className="container py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight">연락처</h2>
              <p className="text-lg text-gray-300">
                언제든지 연락주세요. 전문 팀이 당신의 프로젝트를 도와드리겠습니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>violius@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>문의 전화</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>서울특별시</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">빠른 예약</h3>
              <p className="text-gray-300">
                아래 버튼을 클릭하여 예약 페이지로 이동하세요.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-border text-gray-400 py-8">
        <div className="container text-center">
          <p>&copy; 2024 담음미디어. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
