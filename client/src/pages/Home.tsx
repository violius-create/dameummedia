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
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const { data: concertPosts } = trpc.posts.list.useQuery({ category: 'concert', limit: 6 });
  const { data: filmPosts } = trpc.posts.list.useQuery({ category: 'film', limit: 6 });
  const { data: activeHeroBackground } = trpc.heroBackground.getActive.useQuery();
  const { data: heroBackgrounds } = trpc.heroBackground.list.useQuery({});
  const { data: siteBranding } = trpc.siteBranding.get.useQuery();
  
  useEffect(() => {
    console.log("activeHeroBackground:", activeHeroBackground);
    console.log("heroBackgrounds:", heroBackgrounds);
  }, [activeHeroBackground, heroBackgrounds]);

  // siteBranding 데이터 로드
  useEffect(() => {
    if (siteBranding) {
      setHeroTitle(siteBranding.title || '담음미디어');
      setHeroSubtitle(siteBranding.subtitle || 'Professional Media Production');
    }
  }, [siteBranding]);

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
      {/* Top Navigation Bar - Gray Background */}
      {/* Top Navigation Bar - Gray Background */}
      <nav className="sticky top-0 z-50 bg-gray-700 border-b border-gray-600">
        <div className="container py-2 flex items-center justify-end gap-4">
          <a href={getLoginUrl()} className="text-white text-sm hover:text-gray-300">
            LOGIN
          </a>
          <a href="#" className="text-white text-sm hover:text-gray-300">
            JOIN
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
            <Youtube className="h-4 w-4" />
          </a>
        </div>
      </nav>

      {/* Main Navigation Bar - White Background */}
      <nav className="sticky top-12 z-50 border-b border-border bg-background">
        <div className="container py-4 flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            {siteBranding?.logoUrl && (
              <img src={siteBranding.logoUrl} alt="Logo" className="h-8 w-8 rounded" />
            )}
            <span className="text-lg font-semibold text-foreground">{heroTitle}</span>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/information">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">Information</Button>
            </Link>
            <Link href="/price">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">Price</Button>
            </Link>
            <Link href="/concert-live">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">Concert Live</Button>
            </Link>
            <Link href="/making-film">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">Making Film</Button>
            </Link>
            <Link href="/reservation">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">Reservation</Button>
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

      {/* Split-Screen Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-gray-100">
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-transparent" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative container py-24 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Left Content */}
            <div className="z-10 space-y-6">
              <div className="inline-block rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 border border-blue-500/20">
                Professional Media Production
              </div>
              <h2 className="text-6xl font-bold tracking-tight text-white leading-tight">
                {heroTitle}
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                고품질의 공연 촬영, 음향 녹음, 뮤직 비디오 제작 서비스. 20년 이상의 경험으로 당신의 공연을 완벽하게 기록합니다.
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="/reservation">
                  <Button size="lg" className="font-semibold">
                    예약하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/information">
                  <Button size="lg" variant="outline" className="font-semibold">
                    자세히 보기
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Media */}
            <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Background Image - Show uploaded image or fallback */}
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

              {/* Overlay Gradient */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`
                }}
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer border border-white/30">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Additional Hero Sections - Section 2 and 3 */}
      {heroBackgrounds && heroBackgrounds.length > 0 && (
        <>
          {['section2', 'section3'].map((section) => {
            const sectionBg = heroBackgrounds.find((bg: any) => bg.section === section && bg.isActive === 1);
            if (!sectionBg) return null;
            
            return (
              <section key={section} className="relative h-[350px] overflow-hidden bg-gray-100 mt-[10px]">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-transparent" />
                
                <div className="relative container py-12 h-full flex items-center">
                  <div className="grid md:grid-cols-2 gap-12 items-center w-full">
                    <div className="z-10 space-y-6">
                      <h2 className="text-5xl font-bold tracking-tight text-white">
                        {sectionBg.title}
                      </h2>
                      {sectionBg.description && (
                        <p className="text-lg text-gray-100">
                          {sectionBg.description}
                        </p>
                      )}
                      <Link href="/reservation">
                        <Button size="lg" className="font-semibold">
                          예약하기
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>

                    <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
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

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer border border-white/30">
                          <Play className="w-10 h-10 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* Concert Live Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-24">
          <div className="mb-12">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">공연 영상</h2>
            <p className="text-lg text-muted-foreground">최근 촬영된 공연 영상</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {concertPosts?.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                  <Link href={`/concert-live/${post.id}`}>
                    <Button variant="ghost" size="sm" className="mt-4">
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/concert-live">
              <Button variant="outline" size="lg">
                모든 공연 영상 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Making Film Section */}
      <section className="bg-background border-t border-border">
        <div className="container py-24">
          <div className="mb-12">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">영상 제작</h2>
            <p className="text-lg text-muted-foreground">최근 제작된 영상 콘텐츠</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filmPosts?.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                  <Link href={`/making-film/${post.id}`}>
                    <Button variant="ghost" size="sm" className="mt-4">
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/making-film">
              <Button variant="outline" size="lg">
                모든 영상 제작 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
              <Link href="/reservation">
                <Button size="lg" className="w-full font-semibold">
                  지금 예약하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
