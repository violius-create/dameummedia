import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Music, Film, Calendar, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [heroTitle, setHeroTitle] = useState('담음미디어');
  const [heroSubtitle, setHeroSubtitle] = useState('Professional Media Production');
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const [displayedBackground, setDisplayedBackground] = useState<any>(null);
  const { data: concertPosts } = trpc.posts.list.useQuery({ category: 'concert', limit: 6 });
  const { data: filmPosts } = trpc.posts.list.useQuery({ category: 'film', limit: 6 });
  const { data: activeHeroBackground, isLoading: heroLoading } = trpc.heroBackground.getActive.useQuery();

  // 로컬 스토리지에서 설정 로드
  useEffect(() => {
    const savedTitle = localStorage.getItem('heroTitle');
    const savedSubtitle = localStorage.getItem('heroSubtitle');
    const savedOpacity = localStorage.getItem('overlayOpacity');
    
    if (savedTitle) setHeroTitle(savedTitle);
    if (savedSubtitle) setHeroSubtitle(savedSubtitle);
    if (savedOpacity) setOverlayOpacity(Number(savedOpacity));
  }, []);

  // 배경 영상 데이터가 로드되면 업데이트
  useEffect(() => {
    if (activeHeroBackground && !heroLoading) {
      setDisplayedBackground(activeHeroBackground);
    }
  }, [activeHeroBackground, heroLoading]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">{heroTitle}</h1>
                <p className="text-xs text-muted-foreground">{heroSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/information">
                <Button variant="ghost" size="sm">Information</Button>
              </Link>
              <Link href="/price">
                <Button variant="ghost" size="sm">Price</Button>
              </Link>
              <Link href="/concert-live">
                <Button variant="ghost" size="sm">Concert Live</Button>
              </Link>
              <Link href="/making-film">
                <Button variant="ghost" size="sm">Making Film</Button>
              </Link>
              <Link href="/reservation">
                <Button variant="ghost" size="sm">Reservation</Button>
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
              {!isAuthenticated ? (
                <a href={getLoginUrl()}>
                  <Button size="sm">로그인</Button>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      trpc.auth.logout.useMutation().mutate();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Title Section with Background Video */}
      <section className="relative w-full h-96 overflow-hidden bg-gray-400">
        {/* Background Video or Image */}
        {displayedBackground?.mediaUrl ? (
          displayedBackground?.type === 'video' ? (
            <video
              key={displayedBackground.id}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={displayedBackground.mediaUrl} type="video/mp4" />
            </video>
          ) : (
            <img
              key={displayedBackground.id}
              className="absolute inset-0 w-full h-full object-cover"
              src={displayedBackground.mediaUrl}
              alt="Hero Background"
            />
          )
        ) : (
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200"
            alt="Hero Background"
          />
        )}
        
        {/* Dark Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, 0.4)`,
          }}
        />
        
        {/* Title Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold tracking-tight mb-4">{heroTitle}</h1>
            <p className="text-2xl text-gray-200">{heroSubtitle}</p>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="border-b border-border bg-background">
        <div className="container py-24">
          <div className="max-w-3xl">
            <h2 className="mb-6 text-5xl font-bold tracking-tight text-foreground">
              Concert Live<br />
              <span className="text-primary">Recorded, Mixed, Mastered, and Video</span>
            </h2>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              고품질의 공연 촬영, 음향 녹음, 믹싱, 마스터링 및 영상 제작 서비스를 제공합니다.
              20년 이상의 경험으로 당신의 공연을 완벽하게 기록합니다.
            </p>
            <div className="flex gap-4">
              <Link href="/reservation">
                <Button size="lg" className="font-semibold">
                  예약하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/information">
                <Button size="lg" variant="outline" className="font-semibold">
                  서비스 소개
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Concert Live Section */}
      <section className="bg-background">
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
                더보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Making Film Section */}
      <section className="border-t border-border bg-background">
        <div className="container py-24">
          <div className="mb-12">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">영화 제작</h2>
            <p className="text-lg text-muted-foreground">프로페셔널한 영화 제작 서비스</p>
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
                더보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-border bg-card">
        <div className="container py-24">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-4xl font-bold tracking-tight">문의하기</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              담음미디어의 서비스에 대해 궁금한 점이 있으신가요? 언제든지 연락주세요.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">전화</p>
                  <p className="text-muted-foreground">010-XXXX-XXXX</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">이메일</p>
                  <p className="text-muted-foreground">info@dameum.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">주소</p>
                  <p className="text-muted-foreground">서울시 강남구</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 담음미디어. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
