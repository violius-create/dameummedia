import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Music, Film, Calendar, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: concertPosts } = trpc.posts.list.useQuery({ category: 'concert', limit: 6 });
  const { data: filmPosts } = trpc.posts.list.useQuery({ category: 'film', limit: 6 });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">담음미디어</h1>
                <p className="text-xs text-muted-foreground">Professional Media Production</p>
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

      {/* Services Section */}
      <section className="border-b border-border bg-background">
        <div className="container py-16">
          <h3 className="mb-12 text-3xl font-bold text-foreground">주요 서비스</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Music className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-foreground">Concert Live</CardTitle>
                <CardDescription>공연 촬영 및 음향 제작</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                전문 장비와 경험 많은 팀이 당신의 공연을 생생하게 기록합니다.
                고품질 영상과 음향을 보장합니다.
              </CardContent>
            </Card>
            <Card className="border border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Film className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-foreground">Making Film</CardTitle>
                <CardDescription>뮤직 비디오 및 영상 제작</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                창의적인 영상 제작으로 당신의 음악을 시각적으로 표현합니다.
                프로필 영상, 뮤직 비디오 등 다양한 영상을 제작합니다.
              </CardContent>
            </Card>
            <Card className="border border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-foreground">Reservation</CardTitle>
                <CardDescription>예약 및 상담</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                간편한 온라인 예약 시스템으로 당신의 일정을 관리합니다.
                전문가 상담을 통해 최적의 서비스를 제공합니다.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Concert Live Gallery */}
      <section className="border-b border-border">
        <div className="container py-16">
          <div className="mb-12 flex items-center justify-between">
            <h3 className="text-3xl font-bold">Concert Live</h3>
            <Link href="/concert-live">
              <Button variant="outline">
                더보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {concertPosts?.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col cursor-pointer" onClick={() => window.location.href = `/post/${post.id}`}>
                <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">이미지 없음</p>
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1">
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{post.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/post/${post.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Making Film Gallery */}
      <section className="border-b border-border bg-background">
        <div className="container py-16">
          <div className="mb-12 flex items-center justify-between">
            <h3 className="text-3xl font-bold">Making Film</h3>
            <Link href="/making-film">
              <Button variant="outline">
                더보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {filmPosts?.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `/post/${post.id}`}>
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{post.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/post/${post.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-b border-border bg-background">
        <div className="container py-16">
          <h3 className="mb-12 text-3xl font-bold text-foreground">문의하기</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Phone className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>전화</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">010-9511-7420</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Mail className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>이메일</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm break-all">dameummedia@naver.com</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>주소</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  서울시 관악구 남부순환로 1799<br />
                  대영오피스텔 702호
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="mb-4 font-semibold">담음미디어</h4>
              <p className="text-sm opacity-90">
                20년 이상의 경험으로 고품질의 공연 촬영 및 영상 제작 서비스를 제공합니다.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">메뉴</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li><Link href="/information"><Button variant="link" className="p-0 h-auto text-primary-foreground hover:opacity-80">Information</Button></Link></li>
                <li><Link href="/price"><Button variant="link" className="p-0 h-auto text-primary-foreground hover:opacity-80">Price</Button></Link></li>
                <li><Link href="/concert-live"><Button variant="link" className="p-0 h-auto text-primary-foreground hover:opacity-80">Concert Live</Button></Link></li>
                <li><Link href="/making-film"><Button variant="link" className="p-0 h-auto text-primary-foreground hover:opacity-80">Making Film</Button></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">정보</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>사업자등록번호: 696-11-01451</li>
                <li>계좌: 신한 110-182-745370</li>
                <li>카카오톡: violius</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">연락처</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>전화: 010-9511-7420</li>
                <li>이메일: dameummedia@naver.com</li>
                <li>주소: 서울시 관악구 남부순환로 1799</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-90">
            <p>Copyright © 2026 담음미디어. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
