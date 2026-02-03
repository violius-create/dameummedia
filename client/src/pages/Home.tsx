import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Music, Film, Calendar, Mail, Phone, MapPin, LogOut, Play } from "lucide-react";
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

      {/* Split-Screen Hero Section */}
      <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/80 to-transparent" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative container h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 z-10">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full">
                  <p className="text-sm font-semibold text-blue-300">Professional Media Production</p>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  고품질의 공연 촬영, 음향 녹음, 믹싱, 마스터링 및 영상 제작 서비스. 20년 이상의 경험으로 당신의 공연을 완벽하게 기록합니다.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/reservation">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8">
                    예약하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/concert-live">
                  <Button size="lg" variant="outline" className="border-gray-400 text-white hover:bg-white/10 font-semibold px-8">
                    <Play className="mr-2 h-5 w-5" />
                    영상 보기
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-700">
                <div>
                  <p className="text-3xl font-bold text-white">20+</p>
                  <p className="text-sm text-gray-400">Years Experience</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-sm text-gray-400">Projects Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">100%</p>
                  <p className="text-sm text-gray-400">Satisfaction Rate</p>
                </div>
              </div>
            </div>

            {/* Right Media */}
            <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Background Image - Show uploaded image or fallback */}
              {activeHeroBackground?.type === 'video' && activeHeroBackground?.mediaUrl ? (
                <video
                  key={activeHeroBackground.id}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={activeHeroBackground.mediaUrl} type="video/mp4" />
                </video>
              ) : activeHeroBackground?.mediaUrl ? (
                <img
                  key={activeHeroBackground.id}
                  className="w-full h-full object-cover"
                  src={activeHeroBackground.mediaUrl}
                  alt="Hero Background"
                />
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

      {/* Features Section */}
      <section className="border-b border-border bg-background">
        <div className="container py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">음향 녹음</h3>
              <p className="text-muted-foreground">최신 장비를 사용한 고품질 음향 녹음 및 편집</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">영상 제작</h3>
              <p className="text-muted-foreground">4K 이상의 고해상도 영상 촬영 및 편집</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold">빠른 납기</h3>
              <p className="text-muted-foreground">전문 팀과 함께 신속한 완성을 보장합니다</p>
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
                모든 공연 영상 보기
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
            <p className="text-lg text-muted-foreground">최근 제작된 영화 및 영상 프로젝트</p>
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
                모든 영상 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container py-24">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="mb-4 text-4xl font-bold">문의하기</h2>
            <p className="text-lg text-muted-foreground">
              당신의 프로젝트에 대해 이야기해보세요
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <Mail className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">이메일</h3>
              <p className="text-sm text-muted-foreground">violius@gmail.com</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Phone className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">전화</h3>
              <p className="text-sm text-muted-foreground">문의 바랍니다</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <MapPin className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">위치</h3>
              <p className="text-sm text-muted-foreground">서울, 대한민국</p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/reservation">
              <Button size="lg" className="font-semibold">
                지금 예약하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
